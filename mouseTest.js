const {
	mouse,
	Point,
	screen,
	keyboard,
	Key,
	Button,
} = require("@nut-tree/nut-js");

(async () => {
	let screenWidth = await screen.width();
	let screenHeight = await screen.height();
	const target = new Point(0.5 * screenWidth, 0.5 * screenHeight);
	await mouse.setPosition(target);
	// await mouse.scrollDown(-100);
	await mouse.pressButton(Button.LEFT);
	await mouse.releaseButton(Button.LEFT);
	// await keyboard.pressKey(Key.A);
	await keyboard.pressKey(Key.A);
	await keyboard.releaseKey(Key.A);
})();
