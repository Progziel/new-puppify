
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  category_name: 'category_name',
  module: 'module',
  imageUrl: 'imageUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StorefrontScalarFieldEnum = {
  id: 'id',
  title: 'title',
  templateImageId: 'templateImageId',
  storeType: 'storeType',
  subcategory: 'subcategory',
  categoryId: 'categoryId',
  shortDescription: 'shortDescription',
  longDescription: 'longDescription',
  phone: 'phone',
  email: 'email',
  operatingHours: 'operatingHours',
  location: 'location',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  template_index: 'template_index'
};

exports.Prisma.StorefrontTemplateImageScalarFieldEnum = {
  id: 'id',
  imageUrl: 'imageUrl',
  altText: 'altText'
};

exports.Prisma.StorefrontImageScalarFieldEnum = {
  id: 'id',
  storefrontId: 'storefrontId',
  url: 'url',
  createdAt: 'createdAt'
};

exports.Prisma.StorefrontVideoScalarFieldEnum = {
  id: 'id',
  storefrontId: 'storefrontId',
  url: 'url',
  createdAt: 'createdAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  full_name: 'full_name',
  email: 'email',
  password: 'password',
  role: 'role',
  profilePicture: 'profilePicture',
  coverPhoto: 'coverPhoto',
  refreshToken: 'refreshToken',
  phone: 'phone',
  address: 'address',
  emailVerified: 'emailVerified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  location: 'location',
  lastSeen: 'lastSeen',
  status: 'status'
};

exports.Prisma.ServiceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  imageUrl: 'imageUrl',
  createdAt: 'createdAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  product_name: 'product_name',
  price: 'price',
  rating: 'rating',
  shortDescription: 'shortDescription',
  breed: 'breed',
  gender: 'gender',
  age: 'age',
  healthStatus: 'healthStatus',
  longDescription: 'longDescription',
  createdAt: 'createdAt',
  categoryId: 'categoryId',
  featured: 'featured'
};

exports.Prisma.ProductImageScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  url: 'url',
  createdAt: 'createdAt'
};

exports.Prisma.ProductVideoScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  url: 'url',
  createdAt: 'createdAt'
};

exports.Prisma.AppointmentScalarFieldEnum = {
  id: 'id',
  serviceId: 'serviceId',
  userId: 'userId',
  dateTime: 'dateTime',
  createdAt: 'createdAt'
};

exports.Prisma.MeetingScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  userId: 'userId',
  invitedId: 'invitedId',
  dateTime: 'dateTime',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  receiverId: 'receiverId',
  conversationId: 'conversationId',
  content: 'content',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isRead: 'isRead'
};

exports.Prisma.BuyerProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId'
};

exports.Prisma.SellerProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId'
};

exports.Prisma.ConnectionRequestScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  receiverId: 'receiverId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConnectedAccountScalarFieldEnum = {
  id: 'id',
  userId1: 'userId1',
  userId2: 'userId2',
  createdAt: 'createdAt'
};

exports.Prisma.OtpScalarFieldEnum = {
  id: 'id',
  email: 'email',
  otp: 'otp',
  otpExpiresAt: 'otpExpiresAt'
};

exports.Prisma.AdvertisementScalarFieldEnum = {
  id: 'id',
  title: 'title',
  imageUrl: 'imageUrl',
  redirectTo: 'redirectTo',
  redirectType: 'redirectType',
  slogan: 'slogan',
  description: 'description',
  isActive: 'isActive',
  advertisementType: 'advertisementType',
  template_index: 'template_index',
  createdAt: 'createdAt'
};

exports.Prisma.PostScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  advertisementId: 'advertisementId',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LikeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  postId: 'postId',
  createdAt: 'createdAt'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  postId: 'postId',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FavoriteScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  productId: 'productId',
  createdAt: 'createdAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  productId: 'productId',
  quantity: 'quantity',
  totalPrice: 'totalPrice',
  orderNumber: 'orderNumber',
  deliveryMethod: 'deliveryMethod',
  deliveryAddress: 'deliveryAddress',
  estimatedArrival: 'estimatedArrival',
  billingDetails: 'billingDetails',
  paymentMethod: 'paymentMethod',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.ModuleType = exports.$Enums.ModuleType = {
  DOGS: 'DOGS',
  SERVICES: 'SERVICES',
  APPAREL: 'APPAREL'
};

exports.Role = exports.$Enums.Role = {
  none: 'none',
  buyer: 'buyer',
  seller: 'seller',
  admin: 'admin'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  online: 'online',
  offline: 'offline',
  away: 'away'
};

exports.MessageType = exports.$Enums.MessageType = {
  text: 'text',
  image: 'image',
  file: 'file'
};

exports.ConnectionRequestStatus = exports.$Enums.ConnectionRequestStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELED: 'CANCELED'
};

exports.RedirectType = exports.$Enums.RedirectType = {
  Storefront: 'Storefront',
  Announcement: 'Announcement',
  Buyer: 'Buyer',
  Seller: 'Seller',
  OtherLink: 'OtherLink'
};

exports.AdvertisementType = exports.$Enums.AdvertisementType = {
  Banner: 'Banner',
  Announcement: 'Announcement',
  Dog: 'Dog',
  Service: 'Service',
  Apparel: 'Apparel'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING: 'PENDING',
  CANCELED: 'CANCELED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED'
};

exports.Prisma.ModelName = {
  Category: 'Category',
  Storefront: 'Storefront',
  StorefrontTemplateImage: 'StorefrontTemplateImage',
  StorefrontImage: 'StorefrontImage',
  StorefrontVideo: 'StorefrontVideo',
  User: 'User',
  Service: 'Service',
  Product: 'Product',
  ProductImage: 'ProductImage',
  ProductVideo: 'ProductVideo',
  Appointment: 'Appointment',
  Meeting: 'Meeting',
  Message: 'Message',
  BuyerProfile: 'BuyerProfile',
  SellerProfile: 'SellerProfile',
  ConnectionRequest: 'ConnectionRequest',
  ConnectedAccount: 'ConnectedAccount',
  Otp: 'Otp',
  Advertisement: 'Advertisement',
  Post: 'Post',
  Like: 'Like',
  Comment: 'Comment',
  Favorite: 'Favorite',
  Order: 'Order'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
