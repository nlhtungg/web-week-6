// Bài 6 (Nâng cao): Hiệu ứng nâng cao với JavaScript
// Sử dụng Fetch API, Filter nâng cao, Animation và LocalStorage

// Biến global để lưu trữ dữ liệu
let allProducts = [];
let filteredProducts = [];
let allAuthors = new Set();

// Đợi DOM được tải hoàn toàn
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Ex6 - Hiệu ứng nâng cao với JavaScript đã tải');
    console.log('🌍 URL hiện tại:', window.location.href);
    console.log('📁 Protocol:', window.location.protocol);
    
    // Kiểm tra xem có chạy từ file:// không
    if (window.location.protocol === 'file:') {
        console.warn('⚠️ Đang chạy từ file://, có thể gặp lỗi CORS với Fetch API');
        console.warn('💡 Khuyến nghị: Sử dụng Live Server hoặc http-server');
    }
    
    // Hiển thị loading
    showLoading('Đang tải dữ liệu sản phẩm...');
    
    try {
        // Tải dữ liệu từ JSON file và LocalStorage
        await initializeData();
        
        // Khởi tạo giao diện
        initializeUI();
        
        // Khởi tạo event listeners
        initializeEventListeners();
        
        // Hiển thị sản phẩm
        displayProducts(allProducts);
        
        // Ẩn loading
        hideLoading();
        
        console.log('✅ Tải dữ liệu thành công!');
        showNotification(`✅ Đã tải ${allProducts.length} sản phẩm từ products.json`, 'success');
        
    } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu:', error);
        hideLoading();
        
        // Hiển thị thông báo lỗi chi tiết
        let errorMessage = 'Lỗi khi tải dữ liệu từ products.json. ';
        if (window.location.protocol === 'file:') {
            errorMessage += 'Hãy sử dụng Live Server để chạy website.';
        } else {
            errorMessage += 'Kiểm tra file products.json có tồn tại không.';
        }
        
        showNotification(errorMessage, 'error');
        
        // Fallback to localStorage hoặc dữ liệu mặc định
        initializeFallbackData();
        initializeUI();
        initializeEventListeners();
        displayProducts(allProducts);
        
        showNotification(`📦 Sử dụng dữ liệu fallback: ${allProducts.length} sản phẩm`, 'warning');
    }
});

/**
 * Tải dữ liệu từ JSON file và kết hợp với LocalStorage
 */
async function initializeData() {
    try {
        console.log('🔄 Đang tải dữ liệu từ products.json...');
        
        // Tải dữ liệu từ JSON file
        const response = await fetch('./products.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        console.log('📥 Raw JSON data:', jsonData);
        
        // Kiểm tra cấu trúc JSON - có thể là {products: [...]} hoặc [...]
        let jsonProducts;
        if (Array.isArray(jsonData)) {
            jsonProducts = jsonData;
        } else if (jsonData.products && Array.isArray(jsonData.products)) {
            jsonProducts = jsonData.products;
        } else {
            throw new Error('Cấu trúc JSON không hợp lệ - cần array hoặc {products: array}');
        }
        
        console.log('✅ Đã tải thành công từ JSON:', jsonProducts.length, 'sản phẩm');
        
        // Kiểm tra dữ liệu JSON có hợp lệ không
        if (jsonProducts.length === 0) {
            throw new Error('Dữ liệu JSON rỗng');
        }
        
        // Lấy dữ liệu từ LocalStorage (sản phẩm do user thêm)
        const storedProducts = JSON.parse(localStorage.getItem('bookstore_products') || '[]');
        console.log('📦 LocalStorage có', storedProducts.length, 'sản phẩm');
        
        // Ưu tiên dữ liệu từ JSON, sau đó thêm sản phẩm từ LocalStorage
        const combinedProducts = [...jsonProducts];
        
        // Chỉ thêm sản phẩm từ LocalStorage nếu không trùng ID với JSON
        storedProducts.forEach(stored => {
            const exists = combinedProducts.find(product => product.id === stored.id);
            if (!exists) {
                // Đảm bảo sản phẩm từ localStorage có đầy đủ trường cần thiết
                const validatedProduct = {
                    id: stored.id,
                    name: stored.name || 'Sản phẩm không tên',
                    price: stored.price || 0,
                    category: stored.category || 'Khác',
                    desc: stored.desc || 'Không có mô tả',
                    image: stored.image || `https://via.placeholder.com/200x250/cccccc/ffffff?text=${encodeURIComponent(stored.name || 'No+Name')}`,
                    author: stored.author || 'Không rõ',
                    pages: stored.pages || 0,
                    rating: stored.rating || 0
                };
                combinedProducts.push(validatedProduct);
            }
        });
        
        allProducts = combinedProducts;
        filteredProducts = [...allProducts];
        
        // Tạo danh sách tác giả từ tất cả sản phẩm
        allAuthors.clear();
        allProducts.forEach(product => {
            if (product.author && product.author !== 'Không rõ') {
                allAuthors.add(product.author);
            }
        });
        
        console.log('🎯 Tổng số sản phẩm:', allProducts.length);
        console.log('👥 Số tác giả:', allAuthors.size, '- Danh sách:', Array.from(allAuthors));
        
        return true;
        
    } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu từ JSON:', error);
        throw error;
    }
}

/**
 * Khởi tạo dữ liệu fallback khi không tải được JSON
 */
function initializeFallbackData() {
    console.log('⚠️ Chuyển sang chế độ fallback - không tải được products.json');
    
    const storedProducts = JSON.parse(localStorage.getItem('bookstore_products') || '[]');
    
    if (storedProducts.length > 0) {
        console.log('📦 Sử dụng dữ liệu từ LocalStorage:', storedProducts.length, 'sản phẩm');
        allProducts = storedProducts;
    } else {
        console.log('🔧 Sử dụng dữ liệu mặc định');
        // Dữ liệu mặc định khi không có gì
        allProducts = [
            {
                id: 1,
                name: "Đắc Nhân Tâm",
                price: 120000,
                category: "Kỹ năng sống",
                desc: "Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử",
                image: "https://via.placeholder.com/200x250/3498db/ffffff?text=Đắc+Nhân+Tâm",
                author: "Dale Carnegie",
                pages: 320,
                rating: 4.8
            },
            {
                id: 2,
                name: "Sapiens",
                price: 180000,
                category: "Khoa học",
                desc: "Lược sử loài người từ thời nguyên thủy đến hiện đại",
                image: "https://via.placeholder.com/200x250/e74c3c/ffffff?text=Sapiens",
                author: "Yuval Noah Harari",
                pages: 512,
                rating: 4.6
            },
            {
                id: 3,
                name: "Atomic Habits",
                price: 150000,
                category: "Kỹ năng sống",
                desc: "Hướng dẫn xây dựng thói quen tốt và loại bỏ thói quen xấu",
                image: "https://via.placeholder.com/200x250/2ecc71/ffffff?text=Atomic+Habits",
                author: "James Clear",
                pages: 320,
                rating: 4.7
            }
        ];
    }
    
    filteredProducts = [...allProducts];
    
    // Tạo danh sách tác giả
    allAuthors.clear();
    allProducts.forEach(product => {
        if (product.author && product.author !== 'Không rõ') {
            allAuthors.add(product.author);
        }
    });
    
    console.log('✅ Fallback data ready:', allProducts.length, 'sản phẩm');
}

/**
 * Khởi tạo giao diện
 */
function initializeUI() {
    // Populate author filter
    populateAuthorFilter();
    
    // Update results count
    updateResultsCount();
}

/**
 * Điền danh sách tác giả vào dropdown
 */
function populateAuthorFilter() {
    const authorFilter = document.getElementById('authorFilter');
    if (!authorFilter) return;
    
    // Xóa các option cũ (giữ lại option "Tất cả tác giả")
    while (authorFilter.children.length > 1) {
        authorFilter.removeChild(authorFilter.lastChild);
    }
    
    // Thêm các tác giả
    Array.from(allAuthors).sort().forEach(author => {
        const option = document.createElement('option');
        option.value = author;
        option.textContent = author;
        authorFilter.appendChild(option);
    });
}

/**
 * Khởi tạo tất cả event listeners
 */
function initializeEventListeners() {
    // Tìm kiếm cơ bản
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (clearSearchBtn) clearSearchBtn.addEventListener('click', clearSearch);
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Bộ lọc nâng cao
    const categoryFilter = document.getElementById('categoryFilter');
    const authorFilter = document.getElementById('authorFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const applyPriceFilter = document.getElementById('applyPriceFilter');
    const resetFilters = document.getElementById('resetFilters');
    
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (authorFilter) authorFilter.addEventListener('change', applyFilters);
    if (ratingFilter) ratingFilter.addEventListener('change', applyFilters);
    if (applyPriceFilter) applyPriceFilter.addEventListener('click', applyPriceFilters);
    if (resetFilters) resetFilters.addEventListener('click', resetAllFilters);
    
    // Sắp xếp
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.addEventListener('change', handleSort);
    
    // Form thêm sản phẩm
    const addProductBtn = document.getElementById('addProductBtn');
    const modalOverlay = document.getElementById('modal-overlay');
    const addProductForm = document.getElementById('addProductForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    if (addProductBtn) addProductBtn.addEventListener('click', showModal);
    if (cancelBtn) cancelBtn.addEventListener('click', hideModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                hideModal();
            }
        });
    }
    if (addProductForm) addProductForm.addEventListener('submit', handleAddProduct);
    
    // Form liên hệ
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', handleContactForm);
}

/**
 * Xử lý tìm kiếm cơ bản
 */
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        showNotification('Vui lòng nhập từ khóa tìm kiếm', 'warning');
        searchInput.classList.add('animate-shake');
        setTimeout(() => searchInput.classList.remove('animate-shake'), 500);
        return;
    }
    
    // Lọc sản phẩm theo từ khóa
    filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.desc.toLowerCase().includes(searchTerm) ||
        (product.author && product.author.toLowerCase().includes(searchTerm)) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    
    displayProducts(filteredProducts);
    updateResultsCount();
    
    showNotification(`Tìm thấy ${filteredProducts.length} kết quả cho "${searchTerm}"`, 'success');
}

/**
 * Xóa tìm kiếm
 */
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    
    // Reset về tất cả sản phẩm nhưng giữ bộ lọc khác
    applyFilters();
    showNotification('Đã xóa từ khóa tìm kiếm', 'info');
}

/**
 * Áp dụng các bộ lọc
 */
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const authorFilter = document.getElementById('authorFilter')?.value || '';
    const ratingFilter = document.getElementById('ratingFilter')?.value || '';
    
    filteredProducts = allProducts.filter(product => {
        // Tìm kiếm theo từ khóa
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.desc.toLowerCase().includes(searchTerm) ||
            (product.author && product.author.toLowerCase().includes(searchTerm)) ||
            product.category.toLowerCase().includes(searchTerm);
        
        // Lọc theo thể loại
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        
        // Lọc theo tác giả
        const matchesAuthor = !authorFilter || product.author === authorFilter;
        
        // Lọc theo đánh giá
        const matchesRating = !ratingFilter || (product.rating >= parseFloat(ratingFilter));
        
        return matchesSearch && matchesCategory && matchesAuthor && matchesRating;
    });
    
    displayProducts(filteredProducts);
    updateResultsCount();
}

/**
 * Áp dụng bộ lọc giá
 */
function applyPriceFilters() {
    const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
    
    if (minPrice > maxPrice && maxPrice !== Infinity) {
        showNotification('Giá tối thiểu không thể lớn hơn giá tối đa', 'error');
        return;
    }
    
    // Áp dụng bộ lọc hiện tại trước, sau đó lọc theo giá
    applyFilters();
    
    filteredProducts = filteredProducts.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
    );
    
    displayProducts(filteredProducts);
    updateResultsCount();
    
    const priceText = maxPrice === Infinity ? 
        `từ ${minPrice.toLocaleString('vi-VN')}đ` :
        `từ ${minPrice.toLocaleString('vi-VN')}đ đến ${maxPrice.toLocaleString('vi-VN')}đ`;
    
    showNotification(`Đã lọc theo giá ${priceText}`, 'success');
}

/**
 * Reset tất cả bộ lọc
 */
function resetAllFilters() {
    // Reset form controls
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('authorFilter').value = '';
    document.getElementById('ratingFilter').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortSelect').value = 'name-asc';
    
    // Reset data
    filteredProducts = [...allProducts];
    displayProducts(filteredProducts);
    updateResultsCount();
    
    showNotification('Đã đặt lại tất cả bộ lọc', 'info');
}

/**
 * Xử lý sắp xếp
 */
function handleSort() {
    const sortValue = document.getElementById('sortSelect')?.value || 'name-asc';
    const [field, direction] = sortValue.split('-');
    
    filteredProducts.sort((a, b) => {
        let valueA, valueB;
        
        switch (field) {
            case 'name':
                valueA = a.name.toLowerCase();
                valueB = b.name.toLowerCase();
                break;
            case 'price':
                valueA = a.price;
                valueB = b.price;
                break;
            case 'rating':
                valueA = a.rating || 0;
                valueB = b.rating || 0;
                break;
            default:
                valueA = a.name.toLowerCase();
                valueB = b.name.toLowerCase();
        }
        
        if (direction === 'asc') {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });
    
    displayProducts(filteredProducts);
    showNotification(`Đã sắp xếp theo ${getSortLabel(sortValue)}`, 'info');
}

/**
 * Lấy label cho sorting
 */
function getSortLabel(sortValue) {
    const labels = {
        'name-asc': 'tên A-Z',
        'name-desc': 'tên Z-A',
        'price-asc': 'giá thấp đến cao',
        'price-desc': 'giá cao đến thấp',
        'rating-desc': 'đánh giá cao nhất',
        'rating-asc': 'đánh giá thấp nhất'
    };
    return labels[sortValue] || 'mặc định';
}

/**
 * Hiển thị danh sách sản phẩm với animation
 */
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    
    // Fade out current products
    productList.style.opacity = '0';
    
    setTimeout(() => {
        productList.innerHTML = '';
        
        if (products.length === 0) {
            productList.innerHTML = `
                <div class="no-results">
                    <h3>😔 Không tìm thấy sản phẩm nào</h3>
                    <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    <button onclick="resetAllFilters()" class="btn btn-primary">Đặt lại bộ lọc</button>
                </div>
            `;
        } else {
            products.forEach((product, index) => {
                const productCard = createProductCard(product);
                productCard.style.animationDelay = `${index * 100}ms`;
                productCard.classList.add('adding');
                productList.appendChild(productCard);
            });
        }
        
        // Fade in new products
        productList.style.opacity = '1';
    }, 200);
}

/**
 * Tạo product card với thông tin chi tiết
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    
    // Tạo rating stars
    const stars = '⭐'.repeat(Math.floor(product.rating || 0)) + 
                  (product.rating % 1 >= 0.5 ? '⭐' : '') +
                  '☆'.repeat(5 - Math.ceil(product.rating || 0));
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200x250/cccccc/ffffff?text=No+Image'">
            <div class="product-actions">
                <button class="btn-delete" onclick="deleteProduct(${product.id})" title="Xóa sản phẩm">
                    🗑️
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-author">Tác giả: ${product.author || 'Không rõ'}</p>
            <p class="product-category">Thể loại: ${product.category}</p>
            <p class="product-pages">Số trang: ${product.pages || 'Không rõ'}</p>
            <div class="product-rating">
                <span class="stars">${stars}</span>
                <span class="rating-text">(${product.rating || 0}/5)</span>
            </div>
            <p class="product-price">${product.price.toLocaleString('vi-VN')} VNĐ</p>
            <p class="product-desc">${product.desc}</p>
        </div>
    `;
    
    return card;
}

/**
 * Xóa sản phẩm với animation
 */
function deleteProduct(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }
    
    const productCard = document.querySelector(`[data-id="${productId}"]`);
    if (productCard) {
        productCard.classList.add('removing');
        
        setTimeout(() => {
            // Xóa khỏi arrays
            allProducts = allProducts.filter(p => p.id !== productId);
            filteredProducts = filteredProducts.filter(p => p.id !== productId);
            
            // Cập nhật localStorage
            saveProductsToStorage();
            
            // Refresh display
            displayProducts(filteredProducts);
            updateResultsCount();
            
            showNotification('Đã xóa sản phẩm thành công', 'success');
        }, 300);
    }
}

/**
 * Hiển thị modal thêm sản phẩm với animation
 */
function showModal() {
    const modal = document.getElementById('modal-overlay');
    const modalContent = modal.querySelector('.modal-content');
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    // Animation
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1) translateY(0)';
    }, 10);
    
    // Focus vào input đầu tiên
    setTimeout(() => {
        document.getElementById('newName')?.focus();
    }, 200);
}

/**
 * Ẩn modal với animation
 */
function hideModal() {
    const modal = document.getElementById('modal-overlay');
    const modalContent = modal.querySelector('.modal-content');
    const form = document.getElementById('addProductForm');
    
    // Animation
    modal.style.opacity = '0';
    modalContent.style.transform = 'scale(0.8) translateY(-50px)';
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        
        // Reset form
        if (form) form.reset();
        clearFormErrors();
    }, 300);
}

/**
 * Xử lý thêm sản phẩm mới
 */
function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newProduct = {
        id: Date.now(), // Unique ID
        name: formData.get('newName').trim(),
        price: parseInt(formData.get('newPrice')),
        category: formData.get('newCategory').trim(),
        desc: formData.get('newDesc').trim(),
        image: formData.get('newImage').trim() || `https://via.placeholder.com/200x250/3498db/ffffff?text=${encodeURIComponent(formData.get('newName').trim())}`,
        author: formData.get('newAuthor')?.trim() || 'Không rõ',
        pages: parseInt(formData.get('newPages')) || 0,
        rating: parseFloat(formData.get('newRating')) || 0
    };
    
    // Validate
    if (!validateProduct(newProduct)) {
        return;
    }
    
    // Thêm vào arrays
    allProducts.push(newProduct);
    filteredProducts = [...allProducts]; // Reset filter khi thêm mới
    
    // Thêm tác giả mới vào Set
    if (newProduct.author && newProduct.author !== 'Không rõ') {
        allAuthors.add(newProduct.author);
        populateAuthorFilter();
    }
    
    // Lưu vào localStorage
    saveProductsToStorage();
    
    // Hiển thị lại sản phẩm
    displayProducts(filteredProducts);
    updateResultsCount();
    
    // Ẩn modal
    hideModal();
    
    // Thông báo thành công
    showNotification('Đã thêm sản phẩm thành công!', 'success');
    
    // Scroll đến sản phẩm mới
    setTimeout(() => {
        const newCard = document.querySelector(`[data-id="${newProduct.id}"]`);
        if (newCard) {
            newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newCard.classList.add('animate-pulse');
        }
    }, 500);
}

/**
 * Validate sản phẩm mới
 */
function validateProduct(product) {
    const errors = [];
    
    if (!product.name || product.name.length < 2) {
        errors.push('Tên sản phẩm phải có ít nhất 2 ký tự');
    }
    
    if (!product.price || product.price < 1000) {
        errors.push('Giá sản phẩm phải lớn hơn 1000 VNĐ');
    }
    
    if (!product.category || product.category.length < 2) {
        errors.push('Thể loại phải có ít nhất 2 ký tự');
    }
    
    if (!product.desc || product.desc.length < 10) {
        errors.push('Mô tả phải có ít nhất 10 ký tự');
    }
    
    if (product.rating < 0 || product.rating > 5) {
        errors.push('Đánh giá phải từ 0 đến 5');
    }
    
    if (errors.length > 0) {
        showFormErrors(errors);
        return false;
    }
    
    clearFormErrors();
    return true;
}

/**
 * Hiển thị lỗi form
 */
function showFormErrors(errors) {
    const errorContainer = document.getElementById('form-errors') || createErrorContainer();
    errorContainer.innerHTML = `
        <h4>Vui lòng sửa các lỗi sau:</h4>
        <ul>
            ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
    `;
    errorContainer.style.display = 'block';
    errorContainer.classList.add('animate-shake');
    
    setTimeout(() => {
        errorContainer.classList.remove('animate-shake');
    }, 500);
}

/**
 * Tạo container hiển thị lỗi
 */
function createErrorContainer() {
    const container = document.createElement('div');
    container.id = 'form-errors';
    container.className = 'form-errors';
    container.style.display = 'none';
    
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
        modalBody.insertBefore(container, modalBody.firstChild);
    }
    
    return container;
}

/**
 * Xóa lỗi form
 */
function clearFormErrors() {
    const errorContainer = document.getElementById('form-errors');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

/**
 * Xử lý form liên hệ
 */
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    console.log('Dữ liệu liên hệ:', contactData);
    
    // Simulate sending
    showLoading('Đang gửi tin nhắn...');
    
    setTimeout(() => {
        hideLoading();
        showNotification('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.', 'success');
        e.target.reset();
    }, 1500);
}

/**
 * Lưu sản phẩm vào localStorage
 */
function saveProductsToStorage() {
    try {
        localStorage.setItem('bookstore_products', JSON.stringify(allProducts));
        console.log('Đã lưu dữ liệu vào localStorage');
    } catch (error) {
        console.error('Lỗi khi lưu vào localStorage:', error);
    }
}

/**
 * Cập nhật số lượng kết quả
 */
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        const total = allProducts.length;
        const current = filteredProducts.length;
        
        if (current === total) {
            resultsCount.textContent = `Hiển thị tất cả ${total} sản phẩm`;
        } else {
            resultsCount.textContent = `Hiển thị ${current} / ${total} sản phẩm`;
        }
    }
}

/**
 * Hiển thị loading
 */
function showLoading(message = 'Đang tải...') {
    const existingLoader = document.getElementById('global-loader');
    if (existingLoader) {
        existingLoader.remove();
    }
    
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'global-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(loader);
}

/**
 * Ẩn loading
 */
function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
    }
}

/**
 * Hiển thị thông báo
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto hide
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
// Đợi DOM được tải hoàn toàn
document.addEventListener('DOMContentLoaded', function() {
    console.log('Ex5 - Lưu trữ dữ liệu sản phẩm với LocalStorage đã tải');
    
    // Lấy các phần tử DOM cần thiết
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const addProductBtn = document.getElementById('addProductBtn');
    const modalOverlay = document.getElementById('modal-overlay');
    const addProductForm = document.getElementById('addProductForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const productList = document.getElementById('product-list');
    
    // Khởi tạo LocalStorage và tải dữ liệu sản phẩm
    initializeLocalStorage();
    loadProductsFromStorage();
    
    // Khởi tạo event listeners
    initializeEventListeners();
    
    /**
     * Khởi tạo tất cả event listeners
     */
    function initializeEventListeners() {
        // Event listeners cho tìm kiếm
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        
        // Event listeners cho form thêm sản phẩm
        addProductBtn.addEventListener('click', showModal);
        cancelBtn.addEventListener('click', hideModal);
        closeModalBtn.addEventListener('click', hideModal);
        modalOverlay.addEventListener('click', function(e) {
            // Đóng modal khi click vào overlay (không phải modal content)
            if (e.target === modalOverlay) {
                hideModal();
            }
        });
        addProductForm.addEventListener('submit', handleAddProduct);
        
        // Event listener cho form liên hệ
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', handleContactForm);
        }
        
        // Đóng modal khi nhấn ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
                hideModal();
            }
        });
    }
    
    /**
     * Khởi tạo LocalStorage với dữ liệu mẫu nếu chưa có
     */
    function initializeLocalStorage() {
        // Kiểm tra nếu chưa có dữ liệu sản phẩm trong localStorage
        if (!localStorage.getItem('products')) {
            console.log('Khởi tạo localStorage với sản phẩm mẫu');
            
            // Tạo dữ liệu sản phẩm mẫu ban đầu
            const defaultProducts = [
                {
                    name: 'Thinking, Fast and Slow',
                    price: 156000,
                    desc: 'Tác phẩm của Daniel Kahneman về cách não bộ hoạt động và đưa ra quyết định. Một cuốn sách mở mang tầm nhìn về tâm lý học và kinh tế hành vi.',
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop&crop=face'
                },
                {
                    name: 'The Lean Startup',
                    price: 145000,
                    desc: 'Eric Ries hướng dẫn cách xây dựng startup thành công thông qua phương pháp "học nhanh, thất bại nhanh". Cuốn sách cần thiết cho các entrepreneur trẻ.',
                    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=300&fit=crop'
                },
                {
                    name: 'Code Complete',
                    price: 198000,
                    desc: 'Steve McConnell trình bày nghệ thuật viết code chuyên nghiệp. Cuốn sách kinh điển cho mọi lập trình viên muốn nâng cao kỹ năng.',
                    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=200&h=300&fit=crop'
                }
            ];
            
            // Lưu vào localStorage
            localStorage.setItem('products', JSON.stringify(defaultProducts));
        }
    }
    
    /**
     * Tải dữ liệu sản phẩm từ localStorage và hiển thị
     */
    function loadProductsFromStorage() {
        try {
            const productsData = localStorage.getItem('products');
            if (productsData) {
                const products = JSON.parse(productsData);
                console.log('Tải sản phẩm từ localStorage:', products.length, 'sản phẩm');
                
                // Xóa sản phẩm mẫu có sẵn trong HTML
                productList.innerHTML = '';
                
                // Tạo lại giao diện cho từng sản phẩm
                products.forEach(function(product) {
                    const productElement = createProductElementFromData(product);
                    productList.appendChild(productElement);
                });
                
                console.log('Đã tải thành công', products.length, 'sản phẩm từ localStorage');
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu từ localStorage:', error);
            // Nếu có lỗi, khởi tạo lại với dữ liệu mặc định
            localStorage.removeItem('products');
            initializeLocalStorage();
            loadProductsFromStorage();
        }
    }
    
    /**
     * Lưu danh sách sản phẩm hiện tại vào localStorage
     */
    function saveProductsToStorage() {
        try {
            const productItems = document.querySelectorAll('.product-item');
            const products = [];
            
            productItems.forEach(function(item) {
                const name = item.querySelector('.product-name').textContent;
                const priceText = item.querySelector('.product-price').textContent;
                const desc = item.querySelector('.product-description').textContent;
                const img = item.querySelector('img');
                
                // Trích xuất giá từ text (loại bỏ "Giá: " và các ký tự không phải số)
                const priceNumbers = priceText.replace(/[^\d]/g, '');
                const price = parseFloat(priceNumbers) || 0;
                
                products.push({
                    name: name,
                    price: price,
                    desc: desc,
                    image: img ? img.src : ''
                });
            });
            
            localStorage.setItem('products', JSON.stringify(products));
            console.log('Đã lưu', products.length, 'sản phẩm vào localStorage');
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu vào localStorage:', error);
        }
    }
    
    /**
     * Tạo element sản phẩm từ dữ liệu (dùng cho localStorage)
     */
    function createProductElementFromData(productData) {
        const article = document.createElement('article');
        article.className = 'product-item';
        
        const defaultImage = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop';
        const finalImageUrl = productData.image || defaultImage;
        
        article.innerHTML = `
            <img src="${escapeHtml(finalImageUrl)}" alt="${escapeHtml(productData.name)}" onerror="this.src='${defaultImage}'">
            <h3 class="product-name">${escapeHtml(productData.name)}</h3>
            <p class="product-description">${escapeHtml(productData.desc)}</p>
            <p class="product-price">Giá: ${formatPrice(productData.price)}</p>
        `;
        
        return article;
    }
    
    /**
     * Xóa dữ liệu localStorage (dành cho debug)
     * Gọi clearLocalStorage() trong console để reset dữ liệu
     */
    function clearLocalStorage() {
        localStorage.removeItem('products');
        console.log('Đã xóa dữ liệu sản phẩm khỏi localStorage');
        location.reload(); // Tải lại trang để hiển thị dữ liệu mặc định
    }
    
    // Xuất hàm ra global scope để có thể gọi từ console
    window.clearLocalStorage = clearLocalStorage;
    
    /**
     * Xử lý chức năng tìm kiếm sản phẩm (cập nhật cho bài 4)
     */
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const productItems = document.querySelectorAll('.product-item'); // Lấy lại mỗi lần để bao gồm sản phẩm mới
        let visibleCount = 0;
        
        console.log('=== BẮT ĐẦU TÌM KIẾM ===');
        console.log('Từ khóa tìm kiếm:', searchTerm);
        console.log('Tổng số sản phẩm:', productItems.length);
        
        productItems.forEach(function(item, index) {
            const productName = item.querySelector('.product-name');
            
            if (productName) {
                const nameText = productName.textContent.toLowerCase();
                
                // Kiểm tra tên sản phẩm có chứa từ khóa tìm kiếm không
                const isMatch = nameText.includes(searchTerm) || searchTerm === '';
                
                if (isMatch) {
                    // Hiển thị sản phẩm
                    item.style.display = '';
                    visibleCount++;
                    console.log(`✅ Sản phẩm ${index + 1}: "${productName.textContent}" - HIỂN THỊ`);
                } else {
                    // Ẩn sản phẩm
                    item.style.display = 'none';
                    console.log(`❌ Sản phẩm ${index + 1}: "${productName.textContent}" - ẨN`);
                }
            } else {
                console.log(`⚠️ Sản phẩm ${index + 1}: Không tìm thấy tên sản phẩm`);
            }
        });
        
        console.log('Số sản phẩm hiển thị:', visibleCount);
        console.log('=== KẾT THÚC TÌM KIẾM ===');
        
        // Hiển thị thông báo kết quả tìm kiếm
        showSearchResult(searchTerm);
    }
    
    /**
     * Hiển thị thông báo kết quả tìm kiếm
     */
    function showSearchResult(searchTerm) {
        // Xóa thông báo cũ nếu có
        const existingMessage = document.getElementById('search-result-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (searchTerm !== '') {
            // Đếm số sản phẩm hiển thị - chỉ đếm những sản phẩm KHÔNG có style="display: none"
            const allProducts = document.querySelectorAll('.product-item');
            let visibleCount = 0;
            
            allProducts.forEach(function(product) {
                // Kiểm tra xem sản phẩm có bị ẩn không
                if (product.style.display !== 'none') {
                    visibleCount++;
                }
            });
            
            // Tạo thông báo
            const message = document.createElement('p');
            message.id = 'search-result-message';
            message.style.textAlign = 'center';
            message.style.margin = '1rem 0';
            message.style.fontStyle = 'italic';
            message.style.fontSize = '1.1rem';
            message.style.fontWeight = '500';
            
            if (visibleCount > 0) {
                message.textContent = `Tìm thấy ${visibleCount} sản phẩm cho từ khóa "${searchTerm}"`;
                message.style.color = '#27ae60';
                message.style.background = '#e8f5e8';
                message.style.padding = '0.8rem';
                message.style.borderRadius = '8px';
                message.style.border = '1px solid #27ae60';
            } else {
                message.textContent = `Không tìm thấy sản phẩm nào cho từ khóa "${searchTerm}"`;
                message.style.color = '#e74c3c';
                message.style.background = '#ffeaea';
                message.style.padding = '0.8rem';
                message.style.borderRadius = '8px';
                message.style.border = '1px solid #e74c3c';
            }
            
            // Chèn thông báo vào trước danh sách sản phẩm
            const productsSection = document.getElementById('products');
            const productListDiv = document.getElementById('product-list');
            productsSection.insertBefore(message, productListDiv);
            
            console.log(`Tìm kiếm "${searchTerm}": ${visibleCount} sản phẩm hiển thị`);
        }
    }
    
    /**
     * Hiển thị modal thêm sản phẩm
     */
    function showModal() {
        console.log('Hiển thị modal thêm sản phẩm');
        
        // Hiển thị modal
        modalOverlay.classList.remove('hidden');
        
        // Focus vào trường đầu tiên
        const firstInput = addProductForm.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Ẩn modal thêm sản phẩm
     */
    function hideModal() {
        console.log('Ẩn modal thêm sản phẩm');
        
        // Ẩn modal
        modalOverlay.classList.add('hidden');
        
        // Reset form
        addProductForm.reset();
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    /**
     * Xử lý thêm sản phẩm mới
     */
    function handleAddProduct(e) {
        e.preventDefault(); // Ngăn form submit mặc định
        
        console.log('Xử lý thêm sản phẩm mới');
        
        // Lấy giá trị từ các trường input (theo yêu cầu bài 4)
        const name = document.getElementById('newName').value.trim();
        const price = document.getElementById('newPrice').value.trim();
        const desc = document.getElementById('newDesc').value.trim();
        const imageUrl = document.getElementById('newImage').value.trim();
        
        // Thực hiện kiểm tra hợp lệ (theo yêu cầu bài 4)
        const errorMsg = document.getElementById('errorMsg');
        
        // Validation: Tên sản phẩm không được rỗng
        if (name === '') {
            showErrorMessage('Tên sản phẩm không được rỗng');
            return;
        }
        
        // Validation: Giá phải là số hợp lệ và lớn hơn 0
        if (price === '' || isNaN(price) || Number(price) <= 0) {
            showErrorMessage('Giá phải là số hợp lệ và lớn hơn 0');
            return;
        }
        
        // Validation tuỳ chọn: Mô tả không quá ngắn
        if (desc.length < 10) {
            showErrorMessage('Mô tả phải có ít nhất 10 ký tự');
            return;
        }
        
        // Kiểm tra trùng tên sản phẩm
        if (isProductNameExists(name)) {
            showErrorMessage('Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác');
            return;
        }
        
        // Nếu tất cả hợp lệ, xóa thông báo lỗi
        if (errorMsg) {
            errorMsg.style.display = 'none';
        }
        
        // Tạo phần tử sản phẩm mới (theo yêu cầu bài 4)
        const newItem = createProductElement(name, Number(price), desc, imageUrl);
        
        // Chèn sản phẩm mới vào danh sách (thêm vào đầu theo yêu cầu bài 4)
        if (productList.firstChild) {
            productList.insertBefore(newItem, productList.firstChild); // thêm vào đầu danh sách
        } else {
            productList.appendChild(newItem);
        }
        
        // Hiển thị thông báo thành công
        alert(`Đã thêm sản phẩm "${name}" thành công!`);
        
        // Lưu danh sách sản phẩm vào localStorage (theo yêu cầu bài 5)
        saveProductsToStorage();
        
        // Đóng form và reset (theo yêu cầu bài 4)
        addProductForm.reset(); // Đặt lại giá trị form
        hideModal(); // Ẩn form đi
        
        console.log('Thêm sản phẩm thành công:', name, '- Đã lưu vào localStorage');
    }
    
    /**
     * Tạo phần tử HTML cho sản phẩm mới
     */
    function createProductElement(name, price, description, imageUrl) {
        // Tạo article element
        const article = document.createElement('article');
        article.className = 'product-item';
        
        // Tạo nội dung HTML
        let imageElement = '';
        if (imageUrl) {
            imageElement = `<img src="${imageUrl}" alt="${name}" onerror="this.src='https://via.placeholder.com/200x300/cccccc/ffffff?text=No+Image'">`;
        } else {
            imageElement = `<img src="https://via.placeholder.com/200x300/cccccc/ffffff?text=No+Image" alt="${name}">`;
        }
        
        article.innerHTML = `
            ${imageElement}
            <h3 class="product-name">${escapeHtml(name)}</h3>
            <p class="product-description">${escapeHtml(description)}</p>
            <p class="product-price"><strong>Giá: ${formatPrice(price)}₫</strong></p>
        `;
        
        // Thêm hiệu ứng highlight cho sản phẩm mới
        article.style.border = '2px solid #27ae60';
        article.style.backgroundColor = '#f0fff4';
        
        // Loại bỏ highlight sau 3 giây
        setTimeout(() => {
            article.style.border = '1px solid #ccc';
            article.style.backgroundColor = '#fafafa';
        }, 3000);
        
        return article;
    }
    
    /**
     * Escape HTML để tránh XSS
     */
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    /**
     * Format giá tiền với dấu phân cách
     */
    function formatPrice(price) {
        return Number(price).toLocaleString('vi-VN');
    }
    
    /**
     * Kiểm tra tên sản phẩm đã tồn tại
     */
    function isProductNameExists(name) {
        const existingProducts = document.querySelectorAll('.product-name');
        return Array.from(existingProducts).some(function(product) {
            return product.textContent.toLowerCase() === name.toLowerCase();
        });
    }
    
    /**
     * Hiển thị thông báo lỗi
     */
    function showErrorMessage(message) {
        const errorMsg = document.getElementById('errorMsg');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
        } else {
            alert(message);
        }
        
        // Ẩn thông báo thành công nếu có
        const successMsg = document.getElementById('successMsg');
        if (successMsg) {
            successMsg.style.display = 'none';
        }
    }
    
    /**
     * Xử lý form liên hệ
     */
    function handleContactForm(event) {
        event.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (name && email && message) {
            alert(`Cảm ơn ${name}! Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi qua email ${email} trong thời gian sớm nhất.`);
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.reset();
            }
        }
    }
    
    // Thêm smooth scrolling cho navigation
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    console.log('JavaScript đã được tải và khởi tạo thành công cho bài 5 - LocalStorage!');
});