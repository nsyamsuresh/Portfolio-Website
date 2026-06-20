(function(){
  "use strict";

  var DATA = window.GALLERY_DATA || [];

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById('site-nav');
  function onScroll(){
    if(window.scrollY > 40){ nav.classList.add('scrolled'); }
    else{ nav.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- Theme toggle ---------- */
  var themeToggle = document.getElementById('theme-toggle');
  var root = document.documentElement;
  function setTheme(theme){
    if(theme === 'dark'){ root.setAttribute('data-theme','dark'); }
    else{ root.removeAttribute('data-theme'); }
    themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    localStorage.setItem('theme', theme);
  }
  themeToggle.addEventListener('click', function(){
    var isDark = root.getAttribute('data-theme') === 'dark';
    setTheme(isDark ? 'light' : 'dark');
  });
  themeToggle.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false');

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');
  navToggle.addEventListener('click', function(){
    var open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Gallery rendering ---------- */
  var galleryRoot = document.getElementById('gallery-root');
  var currentView = 'category';

  var CATEGORY_LABELS = {
    digital: 'Digital Illustration',
    ink: 'Ink &amp; Linework',
    watercolor: 'Watercolor &amp; Sketchbook'
  };
  var CATEGORY_ORDER = ['digital', 'ink', 'watercolor'];
  var SERIES_ORDER = ['Afterglow', 'Studies in Ink', 'Watermarks', 'Kindred'];

  function groupBy(arr, key){
    var groups = {};
    arr.forEach(function(item){
      var k = item[key];
      if(!groups[k]) groups[k] = [];
      groups[k].push(item);
    });
    return groups;
  }

  function tileHTML(item, globalIndex){
    return (
      '<div class="tile tile-aspect" data-index="' + globalIndex + '" tabindex="0" role="button" aria-label="View ' + item.title + '">' +
        '<img src="' + item.file + '" alt="' + item.title + ' — ' + item.medium + '">' +
        '<div class="tile-overlay">' +
          '<p class="tile-title">' + item.title + '</p>' +
          '<span class="tile-medium">' + item.medium + '</span>' +
        '</div>' +
      '</div>'
    );
  }

  function render(view){
    currentView = view;
    galleryRoot.innerHTML = '';
    var orderKey = view === 'category' ? CATEGORY_ORDER : SERIES_ORDER;
    var groupKey = view === 'category' ? 'category' : 'series';
    var groups = groupBy(DATA, groupKey);

    orderKey.forEach(function(key){
      var items = groups[key];
      if(!items || !items.length) return;
      var block = document.createElement('div');
      block.className = view === 'category' ? 'category-block' : 'series-group';

      var label = view === 'category' ? CATEGORY_LABELS[key] : key;
      var head = document.createElement('div');
      head.className = 'series-head';
      head.innerHTML = '<h3>' + label + '</h3><span class="series-count">' + String(items.length).padStart(2,'0') + '</span>';
      block.appendChild(head);

      var grid = document.createElement('div');
      grid.className = 'grid';
      grid.innerHTML = items.map(function(item){
        var globalIndex = DATA.indexOf(item);
        return tileHTML(item, globalIndex);
      }).join('');
      block.appendChild(grid);

      galleryRoot.appendChild(block);
    });

    attachTileHandlers();
  }

  function attachTileHandlers(){
    galleryRoot.querySelectorAll('.tile').forEach(function(tile){
      tile.addEventListener('click', function(){
        openLightbox(parseInt(tile.getAttribute('data-index'), 10));
      });
      tile.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          openLightbox(parseInt(tile.getAttribute('data-index'), 10));
        }
      });
    });
  }

  var toggleBtns = document.querySelectorAll('.toggle-btn');
  toggleBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      toggleBtns.forEach(function(b){
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      render(btn.getAttribute('data-view'));
    });
  });

  render('category');

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxTitle = document.getElementById('lightbox-title');
  var lightboxMedium = document.getElementById('lightbox-medium');
  var activeIndex = 0;

  function openLightbox(index){
    activeIndex = index;
    showCurrent();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function showCurrent(){
    var item = DATA[activeIndex];
    if(!item) return;
    lightboxImg.src = item.file;
    lightboxImg.alt = item.title;
    lightboxTitle.textContent = item.title;
    lightboxMedium.textContent = item.medium;
  }
  function nextImage(){ activeIndex = (activeIndex + 1) % DATA.length; showCurrent(); }
  function prevImage(){ activeIndex = (activeIndex - 1 + DATA.length) % DATA.length; showCurrent(); }

  document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-next').addEventListener('click', nextImage);
  document.querySelector('.lightbox-prev').addEventListener('click', prevImage);
  lightbox.addEventListener('click', function(e){
    if(e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function(e){
    if(!lightbox.classList.contains('is-open')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowRight') nextImage();
    if(e.key === 'ArrowLeft') prevImage();
  });

})();
