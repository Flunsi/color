import { roundDynamic100 } from '@flunsi/utility'
import type { Num1, Num100, Num360, RgbDecArray } from './types'


export function getLuminance(rgb: RgbDecArray): Num1 {
	// Formel gemäss WCAG 2.x
	// todo: WCAG 3.0: hat die Formel geändert
	const rgbNew = rgb.map((color) => {
		color /= 255
		if (color <= 0.03928)
			return color / 12.92
		else
			return Math.pow((color + 0.055) / 1.055, 2.4)
	})
	return rgbNew[0] * 0.2126 + rgbNew[1] * 0.7152 + rgbNew[2] * 0.0722
}

export function getGreyHexString(rgb: RgbDecArray) {
	const lum = getLuminance(rgb)
	const grey = lum * 255
	if (grey >= 256)
		throw new Error(`ERROR_getGreyHexString_1: Grey value ${grey} is too high`)
	return rgbDecToHexString([grey, grey, grey])
}

export function getContrast(rgb1: RgbDecArray, rgb2: RgbDecArray): number {
	const lum1 = getLuminance(rgb1)
	const lum2 = getLuminance(rgb2)
	const brightest = Math.max(lum1, lum2)
	const darkest = Math.min(lum1, lum2)
	return (brightest + 0.05) / (darkest + 0.05)
}

export function isBlackTextBetter(rgb: RgbDecArray, rgbBlack: RgbDecArray = [0, 0, 0], rgbWhite: RgbDecArray = [255, 255, 255]): boolean {
	const contrastBlack = getContrast(rgb, rgbBlack)
	const contrastWhite = getContrast(rgb, rgbWhite)
	return contrastBlack > contrastWhite
}

export function hsbToRgb(hue: Num360, sat: Num100, bright: Num100): RgbDecArray {
	sat /= 100
	bright /= 100
	const k = (n: number) => (n + hue / 60) % 6
	const f = (n: number) => bright * (1 - sat * Math.max(0, Math.min(k(n), 4 - k(n), 1)))
	const red = 255 * f(5)
	const green = 255 * f(3)
	const blue = 255 * f(1)
	return [red, green, blue]
}

export function hslToRgb(hue: Num360, sat: Num100, light: Num100): RgbDecArray {
	sat /= 100
	light /= 100
	const k = (n: number) => (n + hue / 30) % 12
	const a = sat * Math.min(light, 1 - light)
	const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
	const red = 255 * f(0)
	const green = 255 * f(8)
	const blue = 255 * f(4)
	return [red, green, blue]
}

export function rgbDecToHexString(rgb: RgbDecArray): string {
	const rbgRounded = rgb.map(v => Math.round(v))

	for (const color of rbgRounded)
		if (color >= 256)
			throw new Error(`ERROR_rgbDecToHexString_1: Color value ${color} is too high`)

	return '#' + rbgRounded.map(v => v.toString(16).padStart(2, "0")).join("")
}

export function getColorDataFromRgb(rgb: RgbDecArray) {
	const rgbHex = rgbDecToHexString(rgb)
	const lum = roundDynamic100(getLuminance(rgb))
	const blackTextBetter = isBlackTextBetter(rgb)
	const contrastRaw = blackTextBetter ? getContrast(rgb, [0, 0, 0]) : getContrast(rgb, [255, 255, 255])
	const contrast = roundDynamic100(contrastRaw)
	const greyHex = getGreyHexString(rgb)
	return { rgb, rgbHex, lum, blackTextBetter, contrast, greyHex }
}
export type ColorData = ReturnType<typeof getColorDataFromRgb>

export function getColorDataFromHsb(hue: Num360, sat: Num100, bright: Num100) {
	const rgb = hsbToRgb(hue, sat, bright)
	return getColorDataFromRgb(rgb)
}

export function getColorDataFromHsl(hue: Num360, sat: Num100, light: Num100) {
	const rgb = hslToRgb(hue, sat, light)
	return getColorDataFromRgb(rgb)
}
