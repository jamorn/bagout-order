# Violet Template 🎨

Modern and beautiful UI template built with Tailwind CSS and Font Awesome icons. Perfect for starting new web projects with a professional, gradient-rich design.

## ✨ Features

- 🎨 **Modern Design** - Beautiful gradient backgrounds and effects
- 📱 **Fully Responsive** - Works perfectly on all devices
- ⚡ **Tailwind CSS** - Utility-first CSS framework
- 🎯 **Font Awesome Icons** - Comprehensive icon library
- 🔧 **Easy to Customize** - Well-organized and documented code
- 🎭 **Smooth Animations** - Engaging user interactions
- 🌈 **Gradient Buttons** - Multiple color schemes included
- 📦 **Ready to Use** - Just download and start building

## 📁 File Structure

```
violet-template/
├── index.html              # Main template page
├── components.html         # Components showcase
├── css/
│   └── template.css       # Custom styles and animations
├── js/
│   └── template.js        # Interactive JavaScript
└── README.md              # Documentation
```

## 🚀 Getting Started

### 1. Quick Start

Simply open `index.html` in your browser to see the template in action.

```bash
# If you have a local server
cd violet-template
# Then open with your preferred method
```

### 2. Using the Template

Include the required CDN links in your HTML:

```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- Custom CSS -->
<link rel="stylesheet" href="css/template.css">
```

### 3. Basic Structure

```html
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Project</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/template.css">
</head>
<body class="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 min-h-screen text-white">
    
    <!-- Your content here -->
    
    <script src="js/template.js"></script>
</body>
</html>
```

## 🎨 Components

### Navbar

```html
<header class="bg-gradient-to-r from-purple-800 to-blue-600 shadow-lg sticky top-0 z-50">
    <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
                <i class="fas fa-gem text-yellow-400 text-2xl"></i>
                <h1 class="text-xl md:text-2xl font-bold">Your Brand</h1>
            </div>
            <button id="menuToggle" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    </div>
</header>
```

### Gradient Buttons

```html
<!-- Purple to Blue -->
<button class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition transform hover:scale-105">
    Button Text
</button>

<!-- Pink to Orange -->
<button class="px-6 py-3 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 rounded-lg transition transform hover:scale-105">
    Button Text
</button>

<!-- Green to Teal -->
<button class="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg transition transform hover:scale-105">
    Button Text
</button>
```

### Cards

```html
<!-- Feature Card -->
<div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition">
    <div class="text-4xl mb-4 text-purple-400">
        <i class="fas fa-rocket"></i>
    </div>
    <h3 class="text-xl font-bold mb-2">Card Title</h3>
    <p class="text-gray-300">Card description goes here.</p>
</div>

<!-- Stat Card -->
<div class="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 text-center">
    <i class="fas fa-users text-4xl text-purple-400 mb-2"></i>
    <div class="text-3xl font-bold mb-1">1,234</div>
    <div class="text-sm text-gray-400">Users</div>
</div>
```

### Badges

```html
<span class="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-300 text-sm">
    <i class="fas fa-star mr-1"></i>Featured
</span>

<span class="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-300 text-sm">
    <i class="fas fa-check mr-1"></i>Verified
</span>
```

### Form Inputs

```html
<!-- Text Input -->
<input type="text" placeholder="Enter text..." 
       class="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg focus:border-purple-500 focus:outline-none">

<!-- Range Slider -->
<input type="range" min="0" max="100" value="50" 
       class="w-full h-2 bg-purple-800 rounded-lg appearance-none cursor-pointer slider">
```

## 🎯 JavaScript Features

### Show Notification

```javascript
// Success notification
window.showNotification('Operation successful!', 'success');

// Error notification
window.showNotification('Something went wrong!', 'error');

// Warning notification
window.showNotification('Please be careful!', 'warning');

// Info notification
window.showNotification('Just so you know...', 'info');
```

### Utility Functions

```javascript
// Show loading spinner
VioletTemplate.showLoading(element);

// Hide loading spinner
VioletTemplate.hideLoading(element);

// Scroll to top
VioletTemplate.scrollToTop();

// Copy to clipboard
VioletTemplate.copyToClipboard('Text to copy');
```

## 🎨 Color Scheme

### Gradient Combinations

- **Purple to Blue**: `from-purple-600 to-blue-600`
- **Pink to Orange**: `from-pink-600 to-orange-600`
- **Green to Teal**: `from-green-600 to-teal-600`
- **Red to Pink**: `from-red-600 to-pink-600`
- **Yellow to Orange**: `from-yellow-600 to-orange-600`
- **Indigo to Purple**: `from-indigo-600 to-purple-600`

### Background Gradient

```css
background: linear-gradient(to bottom right, #1f2937, #5a0eb3, #1f2937);
```

## 📱 Responsive Design

The template is fully responsive with breakpoints:

- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (≥ 768px)
- **Desktop**: `lg:` (≥ 1024px)
- **Large Desktop**: `xl:` (≥ 1280px)

## 🔧 Customization

### Change Primary Colors

Edit the Tailwind config in your HTML:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                'primary': {
                    500: '#your-color',
                    600: '#your-color',
                    700: '#your-color'
                }
            }
        }
    }
}
```

### Custom Animations

Add your own animations in `css/template.css`:

```css
@keyframes yourAnimation {
    from { /* start state */ }
    to { /* end state */ }
}

.your-class {
    animation: yourAnimation 1s ease-in-out;
}
```

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Font Awesome Icons](https://fontawesome.com/icons)
- [MDN Web Docs](https://developer.mozilla.org/)

## 🌟 Examples

Check out `components.html` for a complete showcase of all available components and their variations.

## 💡 Tips

1. **Use Consistent Spacing**: Stick to Tailwind's spacing scale (px-4, py-6, etc.)
2. **Maintain Color Harmony**: Use the predefined gradient combinations
3. **Mobile First**: Design for mobile, then scale up
4. **Accessibility**: Always include proper ARIA labels and alt text
5. **Performance**: Optimize images and minimize custom CSS

## 📝 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ IE11 (not fully supported)

## 🤝 Contributing

Feel free to customize and extend this template for your needs!

## 📄 License

Free to use for personal and commercial projects.

## 🎉 Credits

Built with ❤️ using:
- [Tailwind CSS](https://tailwindcss.com/)
- [Font Awesome](https://fontawesome.com/)
- Modern CSS3 & JavaScript

---

**Happy Coding! 🚀**

For questions or support, refer to the documentation or check the component examples in `components.html`.
