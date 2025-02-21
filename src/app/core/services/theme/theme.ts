export interface ThemeStyleDto extends ThemeStyleRequest {
  id: number
}

export interface ThemeStyleRequest {
  cssContent: string,
  themeName: string
}
