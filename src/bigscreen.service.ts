import { Injectable } from '@angular/core';

import { DocumentRef } from './document-ref';

interface FullscreenControls {

	requestFullscreen: any;

	exitFullscreen: any;

	fullscreenElement: any;

	fullscreenEnabled: string;

	fullscreenchange: string;

	fullscreenerror: string;

}

@Injectable()
export class BigScreenService {

	private fnMap: string[][] = [
		// Object keys
		[
			'requestFullscreen',
			'exitFullscreen',
			'fullscreenElement',
			'fullscreenEnabled',
			'fullscreenchange',
			'fullscreenerror'
		],
		// New WebKit
		[
			'webkitRequestFullscreen',
			'webkitExitFullscreen',
			'webkitFullscreenElement',
			'webkitFullscreenEnabled',
			'webkitfullscreenchange',
			'webkitfullscreenerror'

		],
		// Old WebKit (Safari 5.1)
		[
			'webkitRequestFullScreen',
			'webkitCancelFullScreen',
			'webkitCurrentFullScreenElement',
			'webkitCancelFullScreen',
			'webkitfullscreenchange',
			'webkitfullscreenerror'

		],
		// Mozilla
		[
			'mozRequestFullScreen',
			'mozCancelFullScreen',
			'mozFullScreenElement',
			'mozFullScreenEnabled',
			'mozfullscreenchange',
			'mozfullscreenerror'
		],
		// MS
		[
			'msRequestFullscreen',
			'msExitFullscreen',
			'msFullscreenElement',
			'msFullscreenEnabled',
			'MSFullscreenChange',
			'MSFullscreenError'
		]
	];

	private fn: FullscreenControls;
	private keyboardAllowed: boolean;

	constructor(private _documentRef: DocumentRef) {
		this.keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;
		var ret: any = {};
		var val;

		for (var i = 0; i < this.fnMap.length; i++) {
			val = this.fnMap[i];
			if (val && val[1] in this._documentRef.nativeDocument) {
				for (i = 0; i < val.length; i++) {
					// Map everything to the first list of keys
					ret[this.fnMap[0][i].toString()] = val[i];
				}
				this.fn = ret;
			}
		}
	}

	public request(elem: any) {
		var request = this.fn.requestFullscreen;

		elem = elem || this._documentRef.nativeDocument.documentElement;

		// Work around Safari 5.1 bug: reports support for
		// keyboard in fullscreen even though it doesn't.
		// Browser sniffing, since the alternative with
		// setTimeout is even worse.
		if (/5\.1[.\d]* Safari/.test(navigator.userAgent)) {
			elem[request]();
		} else {
			elem[request](this.keyboardAllowed && (Element as any).ALLOW_KEYBOARD_INPUT);
		}
	}

	public exit() {
		this._documentRef.nativeDocument[this.fn.exitFullscreen]();
	}

	public toggle(elem: any) {
		if (this.isFullscreen()) {
			this.exit();
		} else {
			this.request(elem);
		}
	}

	public onChange(callback: any) {
		this._documentRef.nativeDocument.addEventListener(this.fn.fullscreenchange, callback, false);
	}

	public onError(callback: any) {
		this._documentRef.nativeDocument.addEventListener(this.fn.fullscreenerror, callback, false);
	}

	public isFullscreen() {
		return Boolean(this._documentRef.nativeDocument[this.fn.fullscreenElement]);
	}

	public isEnabled() {
		// Coerce to boolean in case of old WebKit
		return Boolean(this._documentRef.nativeDocument[this.fn.fullscreenEnabled]);
	}

	public getElement() {
		return this._documentRef.nativeDocument[this.fn.fullscreenElement];
	}

}
