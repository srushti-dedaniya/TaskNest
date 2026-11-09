import plugin from 'tailwindcss/plugin'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'on-background': '#1f1b12',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        'on-primary': '#ffffff',
        'on-primary-container': '#9f9b93',
        'on-primary-fixed': '#1d1c16',
        'on-primary-fixed-variant': '#494740',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#795d43',
        'on-secondary-fixed': '#2a1704',
        'on-secondary-fixed-variant': '#5a422a',
        'on-surface': '#1f1b12',
        'on-surface-variant': '#49473f',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#a09b91',
        'on-tertiary-fixed': '#1e1b15',
        'on-tertiary-fixed-variant': '#4a463e',
        background: '#fff8f2',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'inverse-on-surface': '#faefe1',
        'inverse-primary': '#cbc6bd',
        'inverse-surface': '#353026',
        outline: '#7a776e',
        'outline-variant': '#cbc6bc',
        primary: '#201e19',
        'primary-container': '#35332d',
        'primary-fixed': '#e7e2d9',
        'primary-fixed-dim': '#cbc6bd',
        secondary: '#74593f',
        'secondary-container': '#fed9b8',
        'secondary-fixed': '#ffdcbd',
        'secondary-fixed-dim': '#e3c0a0',
        surface: '#fff8f2',
        'surface-bright': '#fff8f2',
        'surface-container': '#f7ecde',
        'surface-container-high': '#f1e7d9',
        'surface-container-highest': '#ebe1d3',
        'surface-container-low': '#fdf2e4',
        'surface-container-lowest': '#ffffff',
        'surface-dim': '#e3d9cb',
        'surface-tint': '#615e57',
        'surface-variant': '#ebe1d3',
        tertiary: '#211e17',
        'tertiary-container': '#36332c',
        'tertiary-fixed': '#e8e2d7',
        'tertiary-fixed-dim': '#ccc6bb'
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px'
      },
      spacing: {
        'margin-mobile': '1rem',
        'margin-tablet': '1.5rem',
        margin: '2.5rem',
        'gutter-mobile': '0.75rem',
        'gutter-tablet': '1rem',
        gutter: '1.5rem',
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2.5rem',
        'space-gutter': '1.5rem',
        'space-gutter-mobile': '0.75rem',
        'space-gutter-tablet': '1rem'
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(53, 51, 45, 0.05)'
      },
      fontFamily: {
        'body-sm': ['Manrope'],
        'body-lg': ['Manrope'],
        'body-md': ['Manrope'],
        'label-md': ['Manrope'],
        'label-xs-caps': ['Manrope'],
        'title-lg': ['Manrope'],
        'title-md': ['Manrope'],
        'headline-sm': ['"Playfair Display"'],
        'headline-lg': ['"Playfair Display"'],
        'headline-lg-mobile': ['"Playfair Display"'],
        'headline-md': ['"Playfair Display"'],
        display: ['"Playfair Display"']
      },
      fontSize: {
        'body-sm': ['12px', { lineHeight: '18px', letterSpacing: '0.01em', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '26px', letterSpacing: '0em', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
        'headline-sm': ['22px', { lineHeight: '30px', letterSpacing: '0em', fontWeight: '500' }],
        'title-md': ['16px', { lineHeight: '24px', letterSpacing: '-0.005em', fontWeight: '600' }],
        'headline-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.015em', fontWeight: '400' }],
        'title-lg': ['18px', { lineHeight: '26px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['32px', { lineHeight: '38px', letterSpacing: '-0.01em', fontWeight: '400' }],
        'headline-md': ['28px', { lineHeight: '36px', letterSpacing: '-0.01em', fontWeight: '500' }],
        'label-xs-caps': ['10px', { lineHeight: '14px', letterSpacing: '0.12em', fontWeight: '600' }],
        display: ['56px', { lineHeight: '64px', letterSpacing: '-0.02em', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '22px', letterSpacing: '0em', fontWeight: '400' }]
      }
    }
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.rounded-DEFAULT': {
          borderRadius: '1rem'
        }
      })
    })
  ]
}
