const { Key } = require("@nut-tree/nut-js");

const keyMapping = {
	MediaNextTrack: Key.AudioNext,
	MediaPreviousTrack: Key.AudioPrev,
	MediaPlayPause: Key.AudioPlay,
	MediaStop: Key.AudioStop,
	AudioVolumeDown: Key.AudioVolDown,
	AudioVolumeUp: Key.AudioVolUp,
	Backquote: Key.Grave,
	AltLeft: Key.LeftAlt,
	BracketLeft: Key.LeftBracket,
	ControlLeft: Key.LeftControl,
	ShiftLeft: Key.LeftShift,
	MetaLeft: Key.LeftSuper,
	AltRight: Key.RightAlt,
	BracketRight: Key.RightBracket,
	ControlRight: Key.RightControl,
	ShiftRight: Key.LeftShift,
	MetaRight: Key.RightSuper,
	PrintScreen: Key.Print,
};

/**
 * Returns the nutjs Key given a browser KeyboardEvent code
 * @param {string} jsKey KeyboardEvent code from browser
 * @returns {Key} nutjs Key
 */
function mapToKey(jsKey) {
	if (jsKey.startsWith("Key")) return Key[jsKey.slice(3)];
	if (jsKey.startsWith("Digit")) return Key["Num" + jsKey.slice(5)];
	if (jsKey.match(/Numpad[0-9]/g)) return Key["NumPad" + jsKey.slice(6)];
	if (jsKey.match(/Numpad[^0-9]/g)) return Key[jsKey.slice(6)];
	if (jsKey.startsWith("F")) return Key[jsKey.slice(5)];
	if (jsKey.startsWith("Arrow")) return Key[jsKey.slice(5)];
	if (jsKey.startsWith("Media")) return Key[jsKey.slice(5)];
	if (keyMapping[jsKey]) return keyMapping[jsKey];
	return Key[jsKey];
}

exports.mapToKey = mapToKey;
