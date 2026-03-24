const fs = require('fs');

let code = fs.readFileSync('./src/pages/Home.jsx', 'utf8');

// Modify heroImg01, heroImg02, heroImg03 for high fetch priority and eager loading
code = code.replace(/<img src=\{heroImg01\}(.*?) \/>/, '<img src={heroImg01} fetchpriority="high" loading="eager" decoding="sync"$1 />');
code = code.replace(/<img src=\{heroImg02\}(.*?) \/>/, '<img src={heroImg02} fetchpriority="high" loading="eager" decoding="async"$1 />');
code = code.replace(/<img src=\{heroImg03\}(.*?) \/>/, '<img src={heroImg03} fetchpriority="high" loading="eager" decoding="async"$1 />');

// Below the fold images -> lazy load
code = code.replace(/<img src=\{icon01\} alt=""\/>/g, '<img src={icon01} loading="lazy" decoding="async" alt="Ícono fase exploratoria"/>');
code = code.replace(/<img src=\{icon02\} alt=""\/>/g, '<img src={icon02} loading="lazy" decoding="async" alt="Ícono conexión virtual"/>');
code = code.replace(/<img src=\{icon03\} alt=""\/>/g, '<img src={icon03} loading="lazy" decoding="async" alt="Ícono agendamiento"/>');

code = code.replace(/<img src=\{featureimg\}(.*?) \/>/g, '<img src={featureimg} loading="lazy" decoding="async"$1 />');
code = code.replace(/<img src=\{videoIcon\}(.*?) \/>/g, '<img src={videoIcon} loading="lazy" decoding="async"$1 />');
code = code.replace(/<img src=\{avatarIcon\}(.*?) \/>/g, '<img src={avatarIcon} loading="lazy" decoding="async"$1 />');
code = code.replace(/<img src=\{faqimg\}(.*?) \/>/g, '<img src={faqimg} loading="lazy" decoding="async"$1 />');

fs.writeFileSync('./src/pages/Home.jsx', code);
console.log('Optimized Home.jsx images');