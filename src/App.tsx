import { useEffect, useState, useRef, type CSSProperties } from 'react'

import domToImage from 'dom-to-image'
import { Image, ArrowDownToLine, Brush, Minus, X, Square } from 'lucide-react'

import { codeToHtml } from 'shiki'
import { useLocalStorage } from 'react-use'

import { defaultCode, languages, themes } from './constants'
import { isLight } from './utils/luma'
import { compressImage } from './utils/compress'
import clsx from 'clsx'

export default function ShikiEditor() {
	const [code, setCode] = useLocalStorage('code', defaultCode)
	const [html, setHtml] = useState('')
	const [backgroundColor, setBackgroundColor] = useState('')

	const codeRef = useRef<HTMLDivElement>(null)
	const fileElementRef = useRef<HTMLInputElement>(null)

	const [language, setLanguage] = useLocalStorage<string>('language')
	const [theme, setTheme] = useLocalStorage<string>('theme')
	const [spacing, setSpacing, delSpacing] = useLocalStorage<number>('spacing')
	const [blur, setBlur, delBlur] = useLocalStorage<number>('blur')
	const [layout, setLayout] = useLocalStorage<number>('layout', 1)
	const [opacity, setOpacity] = useLocalStorage<number>('opacity', 0.8)
	const [title, setTitle] = useLocalStorage<string>('title')
	const [background, setBackground] = useLocalStorage<string>('background')
	const [alias, setAlias] = useLocalStorage<string>('alias', '/')

	const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>(
		'color-scheme',
		'dark'
	)

	useEffect(() => {
		codeToHtml(code ? code + ' ' : '', {
			lang: language ?? 'tsx',
			theme: theme ?? 'catppuccin-latte'
		}).then((html) => {
			const value = html.match(/background-color:#([a-zA-Z0-9]{6})/gs)
			if (!value) return

			const color = value[0].replace('background-color:', '')
			setBackgroundColor(color)
			setColorScheme(isLight(color) ? 'light' : 'dark')

			setHtml(html)
		})
	}, [language, code, theme, setColorScheme])

	const changesAlias = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newValue = e.target.value
		newValue.startsWith('/ ')
		if (newValue.endsWith(' ')) {
			newValue.endsWith('/ ')
			newValue = newValue.trim() + '/'
		}
		if (!newValue) {
			newValue = newValue.trim() + '/'
		}
		setAlias(newValue)
	}

	useEffect(() => {
		if (theme) return

		const systemPrefersDark = window.matchMedia(
			'(prefers-color-scheme: dark)'
		).matches

		setTheme(systemPrefersDark ? 'catppuccin-mocha' : 'catppuccin-latte')
	}, [])

	useEffect(() => {
		if (colorScheme === 'dark')
			document.documentElement.classList.add('dark')
		else document.documentElement.classList.remove('dark')
	}, [colorScheme])

	function saveImage() {
		if (!codeRef.current) return

		domToImage
			.toJpeg(codeRef.current, {
				quality: 1,
				width: codeRef.current.clientWidth * 4,
				height: codeRef.current.clientHeight * 4,
				style: {
					transform: 'scale(4)',
					transformOrigin: 'top left'
				}
			})
			.then((dataUrl) => {
				const link = document.createElement('a')
				link.download = 'code-extinct.jpg'
				link.href = dataUrl
				link.click()
			})
	}

	return (
		<>
			<main className="flex justify-center items-center w-full min-h-dvh pt-8 pb-16">
				{!html ? (
					<Brush
						size={36}
						strokeWidth={1}
						className="text-neutral-300 dark:text-neutral-900 animate-pulse"
					/>
				) : (
					<section className="zoom-sm border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden">
						<div
							ref={codeRef}
							className="relative min-w-52 max-w-7xl"
							style={{
								padding: `${spacing || 70}px`
							}}
						>
							<div
								className="absolute inset-1/2 -translate-1/2 w-7xl h-full bg-center bg-no-repeat"
								style={{
									backgroundImage: `url(${background ?? '/images/herta.webp'})`,
									backgroundSize: 'cover',
									backgroundRepeat: 'no-repeat'
								}}
							/>

							<section
								className={clsx(
									'relative text-lg font-mono rounded-2xl shadow-xl'
								)}
								style={
									Object.assign({
										backgroundColor,
										'--tw-shadow-color': `rgba(0,0,0,${(opacity ?? 0.7) * 0.1})`
									}) as CSSProperties
								}
							>
								<header className="absolute top-2 w-full z-10 flex items-center px-2">
									{layout === 2 && (
										<>
											<input
												type="text"
												placeholder="/ "
												value={alias || ''}
												onChange={changesAlias}
												className="text-sm bg-transparent outline-none text-neutral-500/65 placeholder:text-neutral-500/65 dark:text-neutral-300/65 dark:placeholder:text-neutral-300/65"
											/>

											<input
												type="text"
												placeholder="code.extinct"
												value={title ?? ''}
												onChange={(e) =>
													setTitle(e.target.value)
												}
												className="text-center text-sm bg-transparent outline-none text-neutral-500/65 placeholder:text-neutral-500/65 dark:text-neutral-300/65 dark:placeholder:text-neutral-300/65"
											/>
										</>
									)}

									{layout === 3 && (
										<>
											<div
												className="absolute left-3 size-3.5 rounded-full"
												style={{
													backgroundColor: '#FF605C'
												}}
											/>
											<div
												className="absolute left-8.5 size-3.5 rounded-full"
												style={{
													backgroundColor: '#FFBD44'
												}}
											/>
											<div
												className="absolute left-14 size-3.5 rounded-full"
												style={{
													backgroundColor: '#00CA4E'
												}}
											/>

											<input
												type="text"
												placeholder="code.extinct"
												value={title ?? ''}
												onChange={(e) =>
													setTitle(e.target.value)
												}
												className="w-full text-center text-sm bg-transparent outline-none text-neutral-500/65 placeholder:text-neutral-500/65 dark:text-neutral-300/65 dark:placeholder:text-neutral-300/65"
											/>
											<input
												type="text"
												placeholder="/ "
												value={alias || ''}
												onChange={changesAlias}
												className="text-sm bg-transparent outline-none text-neutral-500/65 placeholder:text-neutral-500/65 dark:text-neutral-300/65 dark:placeholder:text-neutral-300/65"
											/>
										</>
									)}

									{layout === 4 && (
										<>
											<X
												className="absolute right-3.5 text-neutral-600 dark:text-neutral-300/80"
												size={16}
												strokeWidth={1.5}
											/>
											<Square
												className="absolute right-12 text-neutral-600 dark:text-neutral-300/80"
												size={12}
												strokeWidth={1.75}
											/>
											<Minus
												className="absolute right-20 text-neutral-600 dark:text-neutral-300/80"
												size={16}
												strokeWidth={1.5}
											/>
											<input
												type="text"
												placeholder="/ "
												value={alias || ''}
												onChange={changesAlias}
												className="text-sm bg-transparent outline-none text-neutral-500/65 placeholder:text-neutral-500/65 dark:text-neutral-300/65 dark:placeholder:text-neutral-300/65"
											/>

											<input
												type="text"
												placeholder="code.extinct"
												value={title ?? ''}
												onChange={(e) =>
													setTitle(e.target.value)
												}
												className="text-sm bg-transparent outline-none text-neutral-500/65 placeholder:text-neutral-500/65 dark:text-neutral-300/65 dark:placeholder:text-neutral-300/65"
											/>
										</>
									)}

									{layout === 5 && (
										<>
											<X
												className="absolute right-3.5 text-neutral-600 dark:text-neutral-300/80"
												size={16}
												strokeWidth={1.5}
											/>
											<Square
												className="absolute right-12 text-neutral-600 dark:text-neutral-300/80"
												size={12}
												strokeWidth={1.75}
											/>
											<Minus
												className="absolute right-20 text-neutral-600 dark:text-neutral-300/80"
												size={16}
												strokeWidth={1.5}
											/>

											<input
												type="text"
												placeholder="code.extinct"
												value={title ?? ''}
												onChange={(e) =>
													setTitle(e.target.value)
												}
												className="text-left px-2 text-sm bg-transparent outline-none text-neutral-500/65 placeholder:text-neutral-500/65 dark:text-neutral-300/65 dark:placeholder:text-neutral-300/65"
											/>
											<input
												type="text"
												placeholder="/ "
												value={alias || ''}
												onChange={changesAlias}
												className="text-sm bg-transparent outline-none text-neutral-500/65 placeholder:text-neutral-500/65 dark:text-neutral-300/65 dark:placeholder:text-neutral-300/65"
											/>
										</>
									)}
								</header>

								<textarea
									className={clsx(
										'absolute left-0 px-4 z-20 w-full caret-blue-400 text-transparent bg-transparent resize-none border-0 outline-0 whitespace-nowrap overflow-hidden',
										layout === 1 ? 'mt-4' : 'mt-9'
									)}
									style={{
										height: `calc(100% - ${layout === 1 ? 0.5 : 2}rem)`
									}}
									value={code}
									onChange={(e) => setCode(e.target.value)}
									spellCheck={false}
									onKeyDown={(event) => {
										if (event.key === 'Tab') {
											event.preventDefault()
											const target = event.currentTarget
											const start = target.selectionStart
											const end = target.selectionEnd
											const newValue =
												target.value.substring(
													0,
													start
												) +
												'\t' +
												target.value.substring(end)

											setCode(newValue)
											setTimeout(() => {
												target.selectionStart =
													target.selectionEnd =
														start + 1
											}, 0)
										}
									}}
									data-gramm="false"
								/>

								<div className="relative overflow-hidden rounded-xl">
									<div
										className={clsx(
											'relative z-10 px-4 pb-4 whitespace-nowrap overflow-hidden pointer-events-none *:min-w-52 *:min-h-7 **:font-normal! *:bg-transparent! *:rounded-2xl **:not-italic! **:font-mono!',
											layout === 1 ? 'pt-4' : 'pt-9'
										)}
										dangerouslySetInnerHTML={{
											__html: html
										}}
									/>
									<div
										className="absolute z-0 inset-1/2  -translate-1/2 w-7xl h-full bg-center bg-no-repeat scale-100 pointer-events-none"
										style={{
											backgroundImage: `url(${background ?? '/images/herta.webp'})`,
											backgroundSize: 'cover',
											backgroundRepeat: 'no-repeat',
											filter: `blur(${blur ?? 10}px)`,
											opacity: 1 - (opacity ?? 0.8)
										}}
									/>
								</div>
							</section>
						</div>
					</section>
				)}
			</main>
			<aside className="fixed z-30 left-1/2 bottom-4 flex items-center gap-4 max-w-[calc(100%-2rem)] p-4 -translate-x-1/2 text-base text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl shadow-black/5 overflow-y-hidden overflow-x-auto">
				<button
					className="flex justify-center items-center size-9 min-w-9 interact:bg-neutral-400/7.5 interact:text-purple-200 interact:scale-110 rounded-xl transition-all cursor-pointer"
					onClick={() => fileElementRef.current?.click()}
					title="Change Background"
					aria-label="Change Background"
				>
					<Image size={21} strokeWidth={1.5} />
				</button>
				<input
					ref={fileElementRef}
					className="hidden"
					type="file"
					name="background"
					accept="image"
					onInput={async (image) => {
						const file = image.currentTarget.files?.[0]
						if (!file) return

						setBackground(await compressImage(file))
					}}
				/>

				<label className="flex flex-col w-14">
					<span className="text-xs text-neutral-400 font-light">
						Spacing
					</span>
					<input
						type="tel"
						name="spacing"
						pattern="[0-9]+([.][0-9]{1,2})?"
						placeholder="70"
						value={spacing ?? ''}
						className="outline-none max-w-16"
						onChange={(e) => {
							let n = parseFloat(e.currentTarget.value)
							if (isNaN(n)) {
								delSpacing()
								return
							}
							setSpacing(e.target.value as unknown as number)
						}}
					/>
				</label>

				<label className="flex flex-col w-10">
					<span className="text-xs text-neutral-400 font-light">
						Blur
					</span>
					<input
						type="number"
						name="blur"
						pattern="[0-9]+([.][0-9]{1,2})?"
						placeholder="10"
						value={blur ?? ''}
						className="outline-none max-w-16"
						onChange={(e) => {
							let n = parseFloat(e.currentTarget.value)
							if (isNaN(n)) {
								delBlur()
								return
							}
							setBlur(n)
						}}
					/>
				</label>

				<label className="flex flex-col -translate-y-0.5 mr-2">
					<span className="text-xs text-neutral-400 font-light">
						Layout
					</span>
					<div className="flex items-center mt-0.5 gap-0.5">
						{[1, 2, 3, 4, 5].map((key) => (
							<button
								key={key}
								className={clsx(
									'flex justify-center items-center size-5.5 min-w-5.5 interact:scale-110 rounded-lg transition-all cursor-pointer',
									key == layout
										? 'bg-sky-400/10 text-purple-200 scale-100!'
										: 'text-neutral-400 dark:text-neutral-500'
								)}
								onClick={() => setLayout(key)}
							>
								{key}
							</button>
						))}
					</div>
				</label>

				<label className="flex flex-col -translate-y-0.5 mr-2">
					<span className="text-xs text-neutral-400 font-light">
						Opacity ({opacity})
					</span>
					<div className="flex items-center mt-0.5 gap-0.5">
						<input
							type="range"
							min="0"
							max="1"
							step="0.025"
							value={opacity}
							onChange={(e) => {
								const n = parseFloat(e.currentTarget.value)
								if (isNaN(n)) {
									delSpacing()
									return
								}
								setOpacity(e.target.value as unknown as number)
							}}
						/>
					</div>
				</label>

				<label className="flex flex-col">
					<span className="text-xs text-neutral-400 font-light appearance-none">
						Language
					</span>
					<select
						name="theme"
						value={language ?? 'tsx'}
						className="outline-none appearance-none"
						onChange={(e) => setLanguage(e.target.value)}
					>
						{languages.map((language) => (
							<option key={language} value={language}>
								{language}
							</option>
						))}
					</select>
				</label>

				<label className="flex flex-col">
					<span className="text-xs text-neutral-400 font-light">
						Theme
					</span>
					<select
						name="theme"
						value={theme ?? 'catppuccin-latte'}
						className="outline-none appearance-none"
						onChange={(e) => setTheme(e.target.value)}
					>
						{themes.map((theme) => (
							<option key={theme} value={theme}>
								{theme}
							</option>
						))}
					</select>
				</label>

				<button
					className="flex justify-center items-center size-9 min-w-9 interact:bg-neutral-400/7.5 interact:text-purple-200 interact:scale-110 rounded-xl transition-all cursor-pointer"
					onClick={saveImage}
					title="Save"
					aria-label="Save"
				>
					<ArrowDownToLine size={21} strokeWidth={1.5} />
				</button>
			</aside>
		</>
	)
}
