function bestCharge(orders) {
  let ordersInfo = getOrdersInfo(orders);
  let result = generateResult(ordersInfo);
  return result;
}

function getOrdersInfo(orders) {
  let ordersInfo = {}
  ordersInfo.orderDetailArray = getOrderDetails(orders);
  ordersInfo.totalOriginPrice = getTotalOriginPrice(ordersInfo.orderDetailArray);
  ordersInfo.discount = getBiggerDiscount(ordersInfo);
  ordersInfo.totalPrice = ordersInfo.totalOriginPrice - ordersInfo.discount.discountValue;
  return ordersInfo;
}

function getOrderDetails(orders) {
  let orderDetailArray = [];
  for (let order of orders) {
    orderDetailArray.push(getOrderDetail(order));
  }
  return orderDetailArray;
}

function getOrderDetail(order) {
  let orderDetail = {};
  let item = getItemByID(order.split(' x ')[0]);
  orderDetail.id = item.id;
  orderDetail.name = item.name;
  orderDetail.itemPrice = item.price;
  orderDetail.amount = parseInt(order.split(' x ')[1]);
  orderDetail.orderPrice = getOrderPrice(item.price, orderDetail.amount);
  return orderDetail;
}

function getItemByID(id) {
  let items = loadAllItems();
  for (let i of items) {
    if (i.id === id) {
      return i;
    }
  }
}

function getTotalOriginPrice(orderDetailArray) {
  return orderDetailArray.reduce((acc, cur) => acc + cur.orderPrice, 0);
}

function getOrderPrice(price, amount) {
  return price * amount;
}

function getBiggerDiscount(ordersInfo) {
  let priceBreakDiscount = {};
  priceBreakDiscount.type = loadPromotions()[0].type;
  priceBreakDiscount.discountValue = getPriceBreakDiscountValue(ordersInfo.totalOriginPrice, 30, 6);

  let itemPercentDiscounts = {};
  itemPercentDiscounts.type = loadPromotions()[1].type;
  [itemPercentDiscounts.discountItemID, itemPercentDiscounts.discountItemName, itemPercentDiscounts.discountValue] = getItemPercentDiscount(ordersInfo.orderDetailArray, 0.5);

  return priceBreakDiscount.discountValue >= itemPercentDiscounts.discountValue ? priceBreakDiscount : itemPercentDiscounts;
}


function getPriceBreakDiscountValue(orderPrice, price, discount) {
  return Math.floor(orderPrice / price) * discount;
}

function getItemPercentDiscount(orderDetailArray, discountPercent) {
  let discountItems = loadPromotions()[1].items;
  let discountItemID = [];
  let discountItemName = [];
  let discountValue = 0;

  for (let orderDetail of orderDetailArray) {
    if (discountItems.includes(orderDetail.id)) {
      discountItemID.push(orderDetail.id);
      discountItemName.push(orderDetail.name);
      discountValue += orderDetail.orderPrice * discountPercent;
    }
  }

  return [discountItemID, discountItemName, discountValue];
}

function generateResult(ordersInfo) {
  let result = '';
  let orderDetail = generateOrderDetail(ordersInfo.orderDetailArray);
  let promotionDetail = generatePromotionDetail(ordersInfo);
  result = `
============= 订餐明细 =============
${orderDetail}
-----------------------------------${promotionDetail}
总计：${ordersInfo.totalPrice}元
===================================`.trim();
  return result;
}

function generateOrderDetail(orderDetailArray) {
  return orderDetailArray.reduce((acc, cur) => acc + `${cur.name} x ${cur.amount} = ${cur.orderPrice}元
`, '').trim();
}

function generatePromotionDetail(ordersInfo) {
  if (ordersInfo.discount.discountValue === 0) {
    return '';
  }
  else if (ordersInfo.discount.type === loadPromotions()[1].type) {
    return `
使用优惠:
${ordersInfo.discount.type}(${ordersInfo.discount.discountItemName.join('，')})，省${ordersInfo.discount.discountValue}元
-----------------------------------`;
  }
  else {
    return `
使用优惠:
${ordersInfo.discount.type}，省${ordersInfo.discount.discountValue}元
-----------------------------------`;
  }
}
