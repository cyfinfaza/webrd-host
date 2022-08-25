const { mouse, Point, screen } = require("@nut-tree/nut-js");

(async () => {
	let screenWidth = await screen.width();
	let screenHeight = await screen.height();
	const target = new Point(0.5 * screenWidth, 0.5 * screenHeight);
	await mouse.setPosition(target);
})();
