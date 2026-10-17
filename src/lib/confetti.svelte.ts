class ConfettiStore {
	burst = $state(0);

	fire() {
		this.burst += 1;
	}
}

export const confetti = new ConfettiStore();
