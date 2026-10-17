// Sets (or rotates) the global PIN in `AppConfig`. Deliberately kept out of the
// seed: the PIN must never live in the repo. The app is blocked until this runs.
//
//   pnpm pin:set                  # local database (`.env`)
//   pnpm pin:set:prod             # hosted Prisma Postgres (direct URL)
//   pnpm pin:set --pin 12345678   # non-interactive
import "dotenv/config"
import { stdin, stdout } from "node:process"
import { PrismaPg } from "@prisma/adapter-pg"

import { APP_CONFIG_ID, hashPin, newSalt } from "../src/lib/auth/pin"
import { PrismaClient } from "../src/lib/shared/server/generated/prisma/client"

const PIN_PATTERN = /^[0-9]{8}$/

/** Reads a line without echoing it (raw mode), so the PIN stays off-screen. */
async function askHidden(question: string): Promise<string> {
	if (!stdin.isTTY) {
		const chunks: Buffer[] = []
		for await (const chunk of stdin) chunks.push(chunk as Buffer)
		return Buffer.concat(chunks).toString("utf8").trim()
	}

	return new Promise<string>((resolve, reject) => {
		stdout.write(question)
		stdin.setRawMode(true)
		stdin.resume()

		let value = ""

		const cleanup = () => {
			stdin.setRawMode(false)
			stdin.pause()
			stdin.off("data", onData)
		}

		const onData = (chunk: Buffer) => {
			for (const char of chunk.toString("utf8")) {
				if (char === "\r" || char === "\n") {
					cleanup()
					stdout.write("\n")
					resolve(value)
					return
				}
				if (char === "\u0003") {
					cleanup()
					reject(new Error("cancelado"))
					return
				}
				if (char === "\u007f" || char === "\b") value = value.slice(0, -1)
				else if (char >= " " && char <= "~") value += char
			}
		}

		stdin.on("data", onData)
	})
}

function fromArguments(args: string[]): string | undefined {
	const index = args.findIndex((arg) => arg === "--pin" || arg === "-p")
	if (index >= 0) return args[index + 1]
	return args.find((arg) => PIN_PATTERN.test(arg))
}

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL
if (!databaseUrl) {
	console.error("Falta DIRECT_URL o DATABASE_URL")
	process.exit(1)
}

const pin = (fromArguments(process.argv.slice(2)) ?? (await askHidden("PIN (8 dígitos): "))).trim()
if (!PIN_PATTERN.test(pin)) {
	console.error("El PIN debe tener exactamente 8 dígitos")
	process.exit(1)
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })
const pinSalt = newSalt()
const pinHash = await hashPin(pin, pinSalt)

await prisma.appConfig.upsert({
	where: { id: APP_CONFIG_ID },
	create: { id: APP_CONFIG_ID, pinSalt, pinHash },
	update: { pinSalt, pinHash, attempts: 0, lockedAt: null },
})

await prisma.$disconnect()
console.log("PIN actualizado.")
