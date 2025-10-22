// Bài 4: Tích hợp toàn bộ - Form đăng ký sản phẩm mới với validation đầy đủ
// Đợi DOM được tải hoàn toàn
document.addEventListener('DOMContentLoaded', function() {
    console.log('Ex4 - Tích hợp toàn bộ - Form đăng ký sản phẩm mới đã tải');
    
    // Lấy các phần tử DOM cần thiết
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const addProductBtn = document.getElementById('addProductBtn');
    const modalOverlay = document.getElementById('modal-overlay');
    const addProductForm = document.getElementById('addProductForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const productList = document.getElementById('product-list');
    
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
        
        // Đóng form và reset (theo yêu cầu bài 4)
        addProductForm.reset(); // Đặt lại giá trị form
        hideModal(); // Ẩn form đi
        
        console.log('Thêm sản phẩm thành công:', name);
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
    
    console.log('JavaScript đã được tải và khởi tạo thành công cho bài 4!');
});