// Profile photo <-> pixel-art version, part of the sunset Easter egg: the avatar is a two-sided
// card (photo in front, pixel art on the back). Unlocking sunset mode (theme.js fires `sunset:on`)
// turns it to the pixel side and, for the rest of the visit, lets a click (or Enter/Space) flip it
// back and forth; before that the photo is just a photo. The pixel picture only downloads once
// it may be needed: when someone starts clicking towards sunset (theme.js fires `sunset:near`) or
// after sunset was found. Loaded in <head> so a state from earlier in the visit (sessionStorage)
// is in place before the page paints: no flash between pages.
(function () {
  var root = document.documentElement;

  function stored(key) {
    try {
      return sessionStorage.getItem(key) === '1';
    } catch (e) {
      return false;
    }
  }

  function store(key, on) {
    try {
      if (on) sessionStorage.setItem(key, '1');
      else sessionStorage.removeItem(key);
    } catch (e) {}
  }

  if (stored('sunset-found')) {
    root.classList.add('avatar-unlocked');
    if (stored('pixel-avatar')) root.classList.add('avatar-pixel');
  } else {
    store('pixel-avatar', false); // pixel side only exists once the egg is found
  }

  function loadPixel() {
    var back = document.querySelector('#avatar .flip-back');
    if (back && !back.getAttribute('src') && back.dataset.src) back.src = back.dataset.src;
  }

  document.addEventListener('sunset:near', loadPixel);

  // Turns the photo into a button once sunset mode has been found.
  function enable(avatar) {
    if (!avatar || !root.classList.contains('avatar-unlocked')) return;
    avatar.setAttribute('role', 'button');
    avatar.setAttribute('tabindex', '0');
    avatar.setAttribute('aria-label', 'Switch between the photo and its pixel-art version');
    avatar.setAttribute('aria-pressed', root.classList.contains('avatar-pixel') ? 'true' : 'false');
  }

  function set(pixel) {
    root.classList.toggle('avatar-pixel', pixel);
    store('pixel-avatar', pixel);
    enable(document.getElementById('avatar'));
  }

  document.addEventListener('sunset:on', function () {
    loadPixel();
    root.classList.add('avatar-unlocked');
    store('sunset-found', true);
    set(true);
  });

  document.addEventListener('DOMContentLoaded', function () {
    var avatar = document.getElementById('avatar');
    if (!avatar) return;

    function flip() {
      if (!root.classList.contains('avatar-unlocked')) return;
      set(!root.classList.contains('avatar-pixel'));
      document.dispatchEvent(new Event('avatar:flip')); // statistics
    }

    if (root.classList.contains('avatar-unlocked')) loadPixel();
    enable(avatar);
    avatar.addEventListener('click', flip);
    avatar.addEventListener('keydown', function (e) {
      if (root.classList.contains('avatar-unlocked') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        flip();
      }
    });
  });
})();
