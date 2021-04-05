const Cart = require("../models/Cart");
const Tracking = require("../models/Tracking");
//checked 2019-06-03
async function mergeCartAndUpdateTracking({ req }) {
  const user = req.session.user || req.user;
  //tracking
  if (req.session.trackId) {
    Tracking.updateUser({
      userId: user._id,
      trackId: req.session.trackId
    });
  }

  //cart
  const cartObj = await Cart.findOrCreateCart({ userId: user._id });
  let cartFromDB = cartObj.cart;
  let cartFinal = cartFromDB;
  const currentCartObj = await Cart.findById(req.session.cartId);
  let currentCart = null;
  if (currentCartObj) currentCart = currentCartObj.cart;

  if (
    currentCart &&
    currentCart.length > 0 &&
    req.session.cartId != cartObj._id
  ) {
    currentCart.forEach(productInfo => {
      const productId = productInfo.product.data._id;
      const productType = productInfo.product.data.productType;
      const qty = productInfo.product.qty;
      if (productType == 1) {
        cartFinal.push(productInfo);
      } else {
        let newInCart = true;

        for (let i = 0; i < cartFromDB.length; i++) {
          if (
            cartFromDB[i].product.data.productType === 0 &&
            String(cartFromDB[i].product.data._id) == String(productId)
          ) {
            cartFromDB[i].product.qty += qty;
            newInCart = false;
            break;
          }
        }
        if (newInCart) {
          cartFinal.push(productInfo);
        }
      }
    });
    await Cart.mergeCart({
      targetCartId: req.session.cartId,
      mergeToId: cartObj._id
    });
  }

  currentCart = cartFinal;
  req.session.cartId = cartObj._id;
  await Cart.updateCart({
    cartId: req.session.cartId,
    cart: currentCart
  });
  req.session.message = {};
  return;
}

module.exports = {
  mergeCartAndUpdateTracking
};
