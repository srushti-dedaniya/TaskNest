import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SCREENS_DIR = path.join(ROOT, 'screens')
const PAGES_DIR = path.join(ROOT, 'src', 'pages')

const SCREEN_MAP = {
  'Landing Page': { group: 'common', name: 'Landing', route: '/', navActions: [{ match: 'Get Started', to: '/login' }] },
  'Login': { group: 'auth', name: 'Login', route: '/login' },
  'Register': { group: 'auth', name: 'Register', route: '/register' },
  'Intern Registration': { group: 'auth', name: 'Register', route: '/register' },
  'Forgot Password': { group: 'auth', name: 'ForgotPassword', route: '/forgot-password' },
  'Notifications': { group: 'common', name: 'Notifications', route: '/notifications' },
  'Not Found': { group: 'common', name: 'NotFound', route: '/404' },
  '404 Not Found': { group: 'common', name: 'NotFound', route: '/404' },
  'Empty States': { group: 'common', name: 'EmptyStates', route: '/empty-states' },
  'Intern Dashboard': { group: 'intern', name: 'Dashboard', route: '/intern/dashboard' },
  'Daily Tasks': { group: 'intern', name: 'DailyTasks', route: '/intern/tasks' },
  'Weekly Goals': { group: 'intern', name: 'WeeklyGoals', route: '/intern/goals' },
  'Task Details': { group: 'intern', name: 'TaskDetails', route: '/intern/task-details' },
  'Submit Task': { group: 'intern', name: 'SubmitTask', route: '/intern/submit' },
  'My Submissions': { group: 'intern', name: 'Submissions', route: '/intern/submissions' },
  'Points and Performance': { group: 'intern', name: 'Points', route: '/intern/points' },
  'Points & Performance': { group: 'intern', name: 'Points', route: '/intern/points' },
  'Intern Profile': { group: 'intern', name: 'Profile', route: '/intern/profile' },
  'Admin Dashboard': { group: 'admin', name: 'Dashboard', route: '/admin/overview' },
  'Create Task': { group: 'admin', name: 'CreateTask', route: '/admin/create-task' },
  'Create / Assign Task': { group: 'admin', name: 'CreateTask', route: '/admin/create-task' },
  'Create-Assign Task': { group: 'admin', name: 'CreateTask', route: '/admin/create-task' },
  'Manage Tasks': { group: 'admin', name: 'ManageTasks', route: '/admin/task-management' },
  'Submission Reviews': { group: 'admin', name: 'Reviews', route: '/admin/reviews' },
  'Evaluate Submission': { group: 'admin', name: 'EvaluateSubmission', route: '/admin/evaluate' },
  'Fellow Management': { group: 'admin', name: 'InternManagement', route: '/admin/fellow-management' },
  'Intern Management': { group: 'admin', name: 'InternManagement', route: '/admin/fellow-management' },
  'Fellow Details': { group: 'admin', name: 'InternDetails', route: '/admin/fellow-details' },
  'Intern Details (Admin View)': { group: 'admin', name: 'InternDetails', route: '/admin/fellow-details' },
  'Admin Settings': { group: 'admin', name: 'Settings', route: '/admin/settings' },
  'Admin Profile / Settings': { group: 'admin', name: 'Settings', route: '/admin/settings' },
  '404 Error Page': { group: 'common', name: 'NotFound', route: '/404' }
}

const ATTR_MAP = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'text-anchor': 'textAnchor',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'clip-path': 'clipPath',
  viewbox: 'viewBox',
  patternunits: 'patternUnits',
  preserveaspectratio: 'preserveAspectRatio',
  tabindex: 'tabIndex',
  maxlength: 'maxLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  readonly: 'readOnly',
  novalidate: 'noValidate',
  spellcheck: 'spellCheck',
  autocomplete: 'autoComplete',
  srcset: 'srcSet',
  datetime: 'dateTime',
  autofocus: 'autoFocus',
  contenteditable: 'contentEditable',
  for: 'htmlFor'
}

const camelize = (s) => s.replace(/-([a-zA-Z0-9])/g, (_, c) => c.toUpperCase())

const cssToObj = (css) =>
  css
    .split(';')
    .map((decl) => {
      const i = decl.indexOf(':')
      if (i === -1) return null
      const prop = decl.slice(0, i).trim()
      const val = decl.slice(i + 1).trim()
      if (!prop || !val) return null
      return `${camelize(prop)}: ${JSON.stringify(val)}`
    })
    .filter(Boolean)
    .join(', ')

const globalAttrRenames = [
  [/\bclass=/g, 'className='],
  [/\bviewbox=/g, 'viewBox='],
  [/\bstroke-width=/g, 'strokeWidth='],
  [/\bstroke-linecap=/g, 'strokeLinecap='],
  [/\bstroke-dasharray=/g, 'strokeDasharray='],
  [/\bstroke-opacity=/g, 'strokeOpacity='],
  [/\bfill-opacity=/g, 'fillOpacity=']
]

function convertBody(bodyHtml) {
  const scripts = []
  let s = bodyHtml

  s = s.replace(/<!--([\s\S]*?)-->/g, (m, inner) => `{/*${inner.trim()}*/}`)

  s = s.replace(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi, (m, code) => {
    if (/tailwind\.config\s*=|cdn\.tailwindcss/.test(m)) return ''
    scripts.push(code.trim())
    return ''
  })

  s = s.replace(/<a([^>]*?)href="#forgot"([^>]*?)>([\s\S]*?)<\/a>/g, '<Link to="/forgot-password"$1$2>$3</Link>')
  s = s.replace(/<a([^>]*?)href="#request"([^>]*?)>([\s\S]*?)<\/a>/g, '<Link to="/register"$1$2>$3</Link>')
  s = s.replace(/<a([^>]*?)href="#login"([^>]*?)>([\s\S]*?)<\/a>/g, '<Link to="/login"$1$2>$3</Link>')
  s = s.replace(/<a([^>]*?)href="#"([^>]*?)>([\s\S]*?[Ss]ign in[\s\S]*?)<\/a>/g, '<Link to="/login"$1$2>$3</Link>')
  s = s.replace(/<a([^>]*?)href="#spec(-modal)?"([^>]*?)>([\s\S]*?)<\/a>/g, '<Link to="/intern/task-details"$1$3>$4</Link>')

  s = s.replace(/<(\/?)(lineargradient|radialgradient)\b/gi, (m, slash, tag) => `<${slash}${tag === 'lineargradient' ? 'linearGradient' : 'radialGradient'}`)

  const PATH_ROUTE_MAP = {
    'intern-dashboard': '/intern/dashboard',
    'tasks-milestones': '/intern/daily-tasks',
    'fellowship-goals': '/intern/weekly-goals',
    'project-submissions': '/intern/submissions',
    'performance-reviews': '/intern/points',
    'intern-profile': '/intern/profile',
    'submit-task': '/intern/tasks',
    'admin-dashboard': '/admin/dashboard',
    'admin-tasks': '/admin/tasks',
    'admin-create-task': '/admin/tasks/create',
    'admin-reviews': '/admin/submissions',
    'admin-settings': '/admin/profile',
    'admin-overview': '/admin/dashboard',
    'task-management': '/admin/tasks',
    'submissions-review-queue': '/admin/submissions',
    'review-grading': '/admin/submissions',
    'fellow-management': '/admin/interns',
    'fellow-details': '/admin/interns',
    'task-details': '/intern/daily-tasks'
  }
  s = s.replace(/<a([^>]*?)data-path="([a-z0-9-]+)"([^>]*?)>([\s\S]*?)<\/a>/gi, (m, pre, dp, post, inner) => {
    const to = PATH_ROUTE_MAP[dp.toLowerCase()]
    if (!to) return m
    return `<Link to="${to}"${pre}${post}>${inner}</Link>`
  })
  s = s.replace(/(<Link\b[^>]*?)\shref="[^"]*"/g, '$1')

  for (const [re, to] of globalAttrRenames) s = s.replace(re, to)
  for (const [from, to] of Object.entries(ATTR_MAP)) {
    if (from === 'for') {
      s = s.replace(/\bfor="/g, 'htmlFor="')
    } else {
      s = s.replace(new RegExp(`\\b${from}=`, 'g'), `${to}=`)
    }
  }

  s = s.replace(/\bstyle\s*=\s*"([^"]*)"/g, (m, css) => `style={{ ${cssToObj(css)} }}`)

  s = s.replace(/<(?:input|textarea)\b[^>]*\/?>/gi, (m) =>
    m.replace(/\svalue=(?:"([^"]*)"|'([^']*)')/i, (mm, v1, v2) => ` defaultValue="${v1 ?? v2}"`)
  )

  s = s.replace(/\bchecked="?([^">]*)"?/g, 'defaultChecked=""')
  s = s.replace(/\bdisabled="?([^">]*)"?/g, 'disabled=""')

  s = s.replace(/\bonclick\s*=\s*"([^"]*)"/gi, (m, code) => {
    const fn = /^([A-Za-z_$][\w$]*)\((.*)\)$/.exec(code.trim())
    if (!fn) return ''
    const args = fn[2].replace(/\bthis\b/g, 'e.currentTarget')
    const sig = /\be\.currentTarget\b/.test(args) ? '(e)' : '()'
    return `onClick={${sig} => { window.__H['${fn[1]}']?.(${args}) }}`
  })
  s = s.replace(/\bonsubmit\s*=\s*"([^"]*)"/gi, (m, code) => {
    const stmts = code
      .replace(/\bevent\./g, 'e.')
      .split(';')
      .filter((x) => x.trim())
      .join('\n    ')
    return `onSubmit={(e) => {\n    ${stmts}\n  }}`
  })

  s = s.replace(/<(br|hr|img|input|meta|link|area|embed|col|param|source|track)((?:[^>'"]|"[^"]*"|'[^']*')*?)(\/?)>/g, '<$1$2 />')

  return { jsx: s, scripts }
}

function fnNames(code) {
  const set = new Set()
  for (const m of code.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)) set.add(m[1])
  return [...set]
}

function indent(text, pad) {
  return text
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : pad + line))
    .join('\n')
}

let converted = 0
for (const file of fs.readdirSync(SCREENS_DIR).sort()) {
  if (!file.endsWith('.html')) continue
  const raw = fs.readFileSync(path.join(SCREENS_DIR, file), 'utf8')

  const markers = []
  for (const m of raw.matchAll(/<!--\s*([\s\S]*?)\s*-->/g)) {
    const title = m[1]
      .replace(/\s+-\s+(HackKro|TaskNest)\s*$/, '')
      .replace(/^Screen\s*\d+\s*[-–]\s*/i, '')
      .trim()
    const key = Object.keys(SCREEN_MAP).find((k) => k.toLowerCase() === title.toLowerCase())
    if (key) markers.push({ index: m.index, title: m[1], spec: SCREEN_MAP[key] })
  }

  for (let i = 0; i < markers.length; i++) {
    const end = i + 1 < markers.length ? markers[i + 1].index : undefined
    const chunk = raw.slice(markers[i].index, end)
    const { spec, title } = markers[i]

    const bodyMatch = chunk.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (!bodyMatch) {
      console.error(`[generate-pages] no <body> in ${file} screen "${title}"`)
      continue
    }
    const bodyClassesMatch = chunk.match(/<body[^>]*\sclass="([^"]*)"/i)
    const bodyClasses = bodyClassesMatch ? bodyClassesMatch[1] : ''

    const { jsx: jsxRaw, scripts } = convertBody(bodyMatch[1])

    let effectBlock = ''
    if (scripts.length) {
      const lines = []
      lines.push('  useEffect(() => {')
      lines.push('    window.__H = {}')
      lines.push('')
      for (const code of scripts) {
        lines.push('    {')
        lines.push(indent(code, '      '))
        for (const fn of fnNames(code)) lines.push(`      window.__H['${fn}'] = (typeof ${fn} !== 'undefined') ? ${fn} : undefined`)
        lines.push('    }')
        lines.push('')
      }
      lines.push('  }, [])')
      effectBlock = lines.join('\n') + '\n\n'
    }

    const imports = []
    if (scripts.length) imports.push("import { useEffect } from 'react'")
    if (/Link\b/.test(jsxRaw)) imports.push("import { Link } from 'react-router-dom'")

    let jsx = jsxRaw
    let navigateHook = ''
    if (spec.navActions?.length) {
      navigateHook = '  const navigate = useNavigate()\n\n'
      imports.push("import { useNavigate } from 'react-router-dom'")
      for (const a of spec.navActions) {
        const re = new RegExp(`(<button[^>]*)(>)\\s*(<span>${a.match}</span>)`)
        if (re.test(jsx)) jsx = jsx.replace(re, `$1 onClick={() => navigate('${a.to}')}$2$3`)
      }
    }

    const source = `${imports.map((x) => `${x}\n`).join('')}${imports.length ? '\n' : ''}export default function ${spec.name}() {\n${navigateHook}${effectBlock}  return (\n    <div className="${bodyClasses}">\n${indent(jsx, '      ')}\n    </div>\n  )\n}\n`

    const outDir = path.join(PAGES_DIR, spec.group)
    fs.mkdirSync(outDir, { recursive: true })
    const outPath = path.join(outDir, `${spec.name}.jsx`)
    fs.writeFileSync(outPath, source)
    converted++
    console.log(`[generate-pages] ${spec.group}/${spec.name}.jsx  <-  "${title}"  (route ${spec.route || ''})`)
  }
}

console.log(`[generate-pages] ${converted} screen(s) converted`)
