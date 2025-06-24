
const log_action_type = {
    VIEW_PRODUCT: 'view_product',              // Khi người dùng xem chi tiết sản phẩm
    SEARCH: 'search',                          // Khi người dùng tìm kiếm từ khoá
    CLICK_PRODUCT: 'click_product',            // Khi người dùng click vào card sản phẩm
    VIEW_SHOP: 'view_shop',            // Khi người dùng click vào card sản phẩm
    ADD_TO_CART: 'add_to_cart',                // Khi người dùng thêm sản phẩm vào giỏ hàng
    PURCHASE: 'purchase',                      // Khi người dùng hoàn tất đơn hàng
    ADD_TO_WISHLIST: 'add_to_wishlist',        // Khi người dùng thêm sản phẩm vào danh sách yêu thích
    FILTER: 'filter',        // Khi người dùng lọc theo danh mục,
    COMMENT: 'comment'
};
module.exports = { log_action_type };