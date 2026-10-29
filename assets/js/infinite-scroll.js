document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('#main');
    let paginatorNav = document.querySelector('.paginator');
    let loadMoreLink = document.querySelector('.paginator a[rel="next"]'); 

    if (!paginatorNav || !loadMoreLink) return;

    let isFetching = false;

    const loadNextPage = async () => {
        if (isFetching) return;
        isFetching = true;

        const nextUrl = loadMoreLink.href;
        const originalText = loadMoreLink.innerHTML;
        loadMoreLink.innerHTML = 'Loading...';

        try {
            const response = await fetch(nextUrl);
            if (!response.ok) throw new Error('Network response failed');
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const newArticles = doc.querySelectorAll('article'); 
            
            newArticles.forEach(article => {
                article.style.opacity = '0';
                mainContainer.insertBefore(article, paginatorNav);
                
                window.getComputedStyle(article).opacity;
                article.style.transition = 'opacity 0.4s ease-in';
                article.style.opacity = '1';
            });

            const newLoadMoreLink = doc.querySelector('.paginator a[rel="next"]');
            
            if (newLoadMoreLink) {
                loadMoreLink.href = newLoadMoreLink.href;
                loadMoreLink.innerHTML = originalText;
            } else {
                observer.disconnect();
                paginatorNav.remove();
            }

        } catch (error) {
            console.error("Infinite scroll failed, falling back to manual link.", error);
            loadMoreLink.innerHTML = originalText;
        } finally {
            isFetching = false;
        }
    };

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px 400px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadNextPage();
            }
        });
    }, observerOptions);

    observer.observe(paginatorNav);
});