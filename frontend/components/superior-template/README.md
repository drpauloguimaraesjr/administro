# Superior Template - React + Tailwind + Framer Motion

Template original do Framer convertido para React com Tailwind CSS e Framer Motion.

## 📁 Estrutura

```
superior-template/
├── components/
│   ├── Navbar.jsx          # Barra de navegação
│   ├── Hero.jsx            # Seção hero principal
│   ├── TrustedBy.jsx       # Logos das empresas parceiras
│   ├── FeatureSection.jsx  # Seção de feature reutilizável
│   ├── FeaturesGrid.jsx    # Grid de features com cards
│   ├── Testimonials.jsx    # Depoimentos
│   ├── FAQ.jsx             # Perguntas frequentes
│   └── Footer.jsx          # Rodapé
├── assets/
│   └── images/             # Imagens do template
├── styles/
│   ├── framer_styles.css   # CSS original do Framer
│   └── framer_scripts.js   # Scripts de animação originais
├── App.jsx                 # Componente principal
├── package.json            # Dependências
├── tailwind.config.js      # Configuração do Tailwind
├── framer_template.html    # HTML original completo
└── framer_full.png         # Screenshot do template
```

## 🚀 Como Usar

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar em desenvolvimento

```bash
npm run dev
```

### 3. Build para produção

```bash
npm run build
```

## 🎨 Customização para NutriBuddy

Para adaptar este template para o NutriBuddy:

### Cores
Edite `tailwind.config.js` para mudar a cor primária de `emerald` para as cores da sua marca.

### Textos
Edite os componentes em `/components` para trocar:
- Headlines
- Descrições
- CTAs

### Imagens
Substitua as imagens em `/assets/images/` pelas do NutriBuddy.

### Features
Edite `FeaturesGrid.jsx` para listar as features do NutriBuddy:
- Plano alimentar personalizado
- Tracking de macros
- Receitas saudáveis
- etc.

## 📦 Dependências

- **React 18** - Framework UI
- **Tailwind CSS 3** - Styling
- **Framer Motion 10** - Animações

## 🔗 Arquivos Originais

O template mantém os arquivos originais do Framer para referência:
- `framer_template.html` - HTML completo
- `styles/framer_styles.css` - CSS original
- `styles/framer_scripts.js` - Scripts de animação

## ✨ Animações

Todas as animações usam Framer Motion:
- Fade in on scroll
- Hover effects
- Stagger animations
- Spring physics

Exemplo:
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
  Conteúdo
</motion.div>
```
