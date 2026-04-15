const posts = window.blogPosts || [];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function imageClass(post) {
  return post.imageClass ? ` post-card__image--${post.imageClass}` : '';
}

function postHref(post, prefix = '') {
  return `${prefix}${post.slug}/`;
}

function byline(post) {
  return `${escapeHtml(post.author)} &middot; ${escapeHtml(post.date)} &middot; ${escapeHtml(post.readTime)}`;
}

function renderHomePreviews() {
  document.querySelectorAll('[data-blog-preview]').forEach((container) => {
    const limit = Number(container.dataset.limit || posts.length);
    const linkPrefix = container.dataset.linkPrefix || 'blog/';
    container.innerHTML = posts.slice(0, limit).map((post) => `
      <article class="post-card reveal" data-title="${escapeHtml(post.title.toLowerCase())}">
        <a href="${escapeHtml(postHref(post, linkPrefix))}">
          <span class="post-card__image${imageClass(post)}" aria-hidden="true"></span>
          <span class="post-card__title">${escapeHtml(post.title)}</span>
        </a>
      </article>
    `).join('');
  });
}

function renderBlogList() {
  document.querySelectorAll('[data-blog-list]').forEach((container) => {
    const linkPrefix = container.dataset.linkPrefix || '';
    container.innerHTML = posts.map((post) => `
      <article class="blog-list-card reveal" data-title="${escapeHtml(post.title.toLowerCase())}">
        <a class="blog-list-card__image blog-list-card__image--${escapeHtml(post.imageClass || 'food')}" href="${escapeHtml(postHref(post, linkPrefix))}" aria-label="Read ${escapeHtml(post.title)}"></a>
        <div class="blog-list-card__body">
          <p class="byline">${byline(post)}</p>
          <h2><a href="${escapeHtml(postHref(post, linkPrefix))}">${escapeHtml(post.title)}</a></h2>
          <p>${escapeHtml(post.excerpt)}</p>
          <div class="post-meta"><span>0 comments</span><button class="like-button" type="button" aria-label="Like post">♡</button></div>
        </div>
      </article>
    `).join('');
  });
}

const headingLines = new Set([
  'Understanding Hormonal Imbalance',
  'The Role of Diet in Hormonal Health',
  'Nourishing Foods',
  'Foods to Avoid',
  'Lifestyle Changes for Hormonal Healing',
  'Regular Exercise',
  'Prioritizing Sleep',
  'Stress Management Techniques',
  'Herbal Remedies and Supplements',
  'Adaptogenic Herbs',
  'Omega 3 Fatty Acids',
  'Vitamin D and Magnesium',
  'The Importance of Hydration',
  'Monitoring and Tracking',
  'Embracing Your Wellness Journey',
  'Coffee and PCOS',
  'Matcha and PCOS',
  'Conclusion',
  'References',
  'My perfect morning routine includes:',
  'Here is what I started doing to reduce that glucose spike:',
  'Understanding Cortisol and Adrenals',
  'My Journey to Stress Reduction',
  'Here are the practices that helped me:',
  'Results and Transformation',
  'Citation:',
  '5 Actionable Ways I Was Able to Improve My PCOS in a Month',
  'Foods I cut out during the phase:',
  'Some tips that helped me:',
  'Things that helped me:'
]);

function formatListItem(text) {
  const escaped = escapeHtml(text);
  const colonIndex = escaped.indexOf(':');
  if (colonIndex > 0 && colonIndex < 35) {
    return `<strong>${escaped.slice(0, colonIndex + 1)}</strong>${escaped.slice(colonIndex + 1)}`;
  }
  return escaped;
}

function contentToHtml(content, title) {
  const lines = content.trim().split('\n').map((line) => line.trimEnd());
  const html = [];
  let inList = false;
  let inCitations = false;

  function closeList() {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  }

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;
    if (index === 0 && line === title) return;

    if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${formatListItem(line.slice(2).trim())}</li>`);
      return;
    }

    closeList();

    if (/^\d+\.\s+/.test(line)) {
      html.push(`<h3>${escapeHtml(line)}</h3>`);
      inCitations = false;
      return;
    }

    if (headingLines.has(line)) {
      html.push(`<h2>${escapeHtml(line.replace(/:$/, ''))}</h2>`);
      inCitations = line === 'References' || line === 'Citation:';
      return;
    }

    if (line.startsWith('Updated:')) {
      html.push(`<p class="byline">${escapeHtml(line)}</p>`);
      return;
    }

    html.push(`<p${inCitations ? ' class="citation-text"' : ''}>${escapeHtml(line)}</p>`);
  });

  closeList();
  return html.join('');
}

function renderPostDetail() {
  document.querySelectorAll('[data-post-slug]').forEach((article) => {
    const slug = article.dataset.postSlug;
    const post = posts.find((item) => item.slug === slug);
    const basePath = article.dataset.basePath || '../../';

    if (!post) {
      article.innerHTML = `
        <a class="post-back" href="${escapeHtml(basePath)}blog/">Back to Blog</a>
        <h1>Post not found</h1>
        <p>Sorry, this article could not be found.</p>
      `;
      return;
    }

    document.title = `${post.title} - Wellness For Her`;
    article.innerHTML = `
      <a class="post-back" href="${escapeHtml(basePath)}blog/">Back to Blog</a>
      <div class="single-post__image single-post__image--${escapeHtml(post.imageClass || 'food')}" aria-hidden="true"></div>
      <p class="byline">${byline(post)}</p>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="single-post__content">${contentToHtml(post.content, post.title)}</div>
    `;
  });
}

renderHomePreviews();
renderBlogList();
renderPostDetail();

document.querySelectorAll('.reveal').forEach((item) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  observer.observe(item);
});

document.querySelectorAll('.js-subscribe-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = form.querySelector('.form-message');
    if (message) message.textContent = 'Thanks for subscribing!';
    form.reset();
  });
});

document.querySelectorAll('.js-work-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = form.querySelector('.form-message');
    if (message) message.textContent = 'Thanks for submitting!';
    form.reset();
  });
});

document.querySelectorAll('.like-button').forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.toggle('is-liked');
    button.textContent = button.classList.contains('is-liked') ? '♥' : '♡';
  });
});

const search = document.getElementById('post-search');
if (search) {
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    document.querySelectorAll('.blog-list-card').forEach((card) => {
      card.hidden = !card.dataset.title.includes(query);
    });
  });
}

const dotLinks = document.querySelectorAll('.dot-nav a');
const dotTargets = ['top', 'intro', 'footer'].map((id) => document.getElementById(id)).filter(Boolean);
if (dotLinks.length && dotTargets.length) {
  const dotObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      dotLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id));
    });
  }, { threshold: 0.35 });
  dotTargets.forEach((target) => dotObserver.observe(target));
}
