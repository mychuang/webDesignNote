(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":2,"ieee754":3}],3:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.camera = void 0;
const Camera_1 = require("./lib/Camera");
const Utils_1 = require("./lib/Utils");
let camera = new Camera_1.Camera();
exports.camera = camera;
let utils = new Utils_1.Utils();
exports.utils = utils;
function handleTwoActionCameraCommand(command, stop) {
    if (!command || !camera)
        return;
    if (stop) {
        switch (command) {
            case Camera_1.LumensCommand.zoom_tele_standard:
            case Camera_1.LumensCommand.zoom_wide_standard:
            case Camera_1.LumensCommand.zoom_tele_variable:
            case Camera_1.LumensCommand.zoom_wide_variable:
                command = Camera_1.LumensCommand.zoom_stop;
                break;
            case Camera_1.LumensCommand.focus_near_standard:
            case Camera_1.LumensCommand.focus_far_standard:
            case Camera_1.LumensCommand.focus_near_variable:
            case Camera_1.LumensCommand.focus_far_variable:
                command = Camera_1.LumensCommand.focus_stop;
                break;
            case Camera_1.LumensCommand.pan_tilt_up:
            case Camera_1.LumensCommand.pan_tilt_down:
            case Camera_1.LumensCommand.pan_tilt_left:
            case Camera_1.LumensCommand.pan_tilt_right:
                command = Camera_1.LumensCommand.pan_tilt_stop;
                break;
        }
    }
    camera.sendCommand(command);
}
document.querySelectorAll(".camera-control").forEach((element) => {
    element.addEventListener("mousedown", (event) => {
        const target = event.target;
        let commandStr = target.getAttribute("data-control");
        if (!commandStr)
            return;
        let command = Camera_1.LumensCommand[commandStr];
        if (target.classList.contains("two-action-btn")) {
            handleTwoActionCameraCommand(command, false);
            // For the sake of received event when mouse cursor is dragged outside of element, you have to register global event 
            document.addEventListener("mouseup", (event) => {
                handleTwoActionCameraCommand(command, true);
            }, { once: true });
        }
        else {
            camera.sendCommand(command);
        }
    });
    element.addEventListener("click", (event) => {
        event.preventDefault();
    });
});

},{"./lib/Camera":5,"./lib/Utils":6}],5:[function(require,module,exports){
(function (Buffer){(function (){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitPosition = exports.MotionlessPreset = exports.FocusMode = exports.FlipStatus = exports.MirrorStatus = exports.PowerStatus = exports.LumensCommand = exports.CameraEvent = exports.Camera = void 0;
const index_1 = require("../index");
let debugFlag = 0;
const msgInitializeFailed = "Dockable launch failed, please reinstall the OBS Plugin and Dockable Controller.";
const msgCameraNotFound = "Failed to connect to the device, please check the network connection and whether the camera has been turned on.";
const msgConnectionLost = "The camera has lost connection!";
const msgConnectionTimeout = "Timeout";
const msgCommandInvalid = "Invalid Command";
var CameraEvent;
(function (CameraEvent) {
    CameraEvent[CameraEvent["unknown"] = 0] = "unknown";
    CameraEvent[CameraEvent["timeout"] = 1] = "timeout";
    CameraEvent[CameraEvent["notFound"] = 2] = "notFound";
    CameraEvent[CameraEvent["disconncted"] = 3] = "disconncted";
    CameraEvent[CameraEvent["connected"] = 4] = "connected";
})(CameraEvent || (CameraEvent = {}));
exports.CameraEvent = CameraEvent;
var PowerStatus;
(function (PowerStatus) {
    PowerStatus[PowerStatus["Disconnected"] = 0] = "Disconnected";
    PowerStatus[PowerStatus["On"] = 2] = "On";
    PowerStatus[PowerStatus["Off"] = 3] = "Off";
})(PowerStatus || (PowerStatus = {}));
exports.PowerStatus = PowerStatus;
var MirrorStatus;
(function (MirrorStatus) {
    MirrorStatus[MirrorStatus["On"] = 2] = "On";
    MirrorStatus[MirrorStatus["Off"] = 3] = "Off";
})(MirrorStatus || (MirrorStatus = {}));
exports.MirrorStatus = MirrorStatus;
var FlipStatus;
(function (FlipStatus) {
    FlipStatus[FlipStatus["On"] = 2] = "On";
    FlipStatus[FlipStatus["Off"] = 3] = "Off";
})(FlipStatus || (FlipStatus = {}));
exports.FlipStatus = FlipStatus;
var FocusMode;
(function (FocusMode) {
    FocusMode[FocusMode["Auto"] = 2] = "Auto";
    FocusMode[FocusMode["Manual"] = 3] = "Manual";
})(FocusMode || (FocusMode = {}));
exports.FocusMode = FocusMode;
var MotionlessPreset;
(function (MotionlessPreset) {
    MotionlessPreset[MotionlessPreset["On"] = 2] = "On";
    MotionlessPreset[MotionlessPreset["Off"] = 3] = "Off";
})(MotionlessPreset || (MotionlessPreset = {}));
exports.MotionlessPreset = MotionlessPreset;
var InitPosition;
(function (InitPosition) {
    InitPosition[InitPosition["LastMem"] = 2] = "LastMem";
    InitPosition[InitPosition["FirstPreset"] = 3] = "FirstPreset";
})(InitPosition || (InitPosition = {}));
exports.InitPosition = InitPosition;
var LumensCommand;
(function (LumensCommand) {
    LumensCommand["not_set"] = "";
    LumensCommand["power_on"] = "01040002";
    LumensCommand["power_off"] = "01040003";
    LumensCommand["zoom_stop"] = "01040700";
    LumensCommand["zoom_tele_standard"] = "01040702";
    LumensCommand["zoom_wide_standard"] = "01040703";
    LumensCommand["zoom_tele_step"] = "01040704";
    LumensCommand["zoom_wide_step"] = "01040705";
    LumensCommand["zoom_tele_variable"] = "0104072";
    LumensCommand["zoom_wide_variable"] = "0104073";
    LumensCommand["focus_stop"] = "01040800";
    LumensCommand["focus_far_standard"] = "01040802";
    LumensCommand["focus_near_standard"] = "01040803";
    LumensCommand["focus_far_step"] = "01040804";
    LumensCommand["focus_near_step"] = "01040805";
    LumensCommand["focus_far_variable"] = "0104082";
    LumensCommand["focus_near_variable"] = "0104083";
    LumensCommand["pan_tilt_home"] = "010604";
    LumensCommand["pan_tilt_up"] = "0301";
    LumensCommand["pan_tilt_down"] = "0302";
    LumensCommand["pan_tilt_left"] = "0103";
    LumensCommand["pan_tilt_right"] = "0203";
    LumensCommand["pan_tilt_stop"] = "0303";
    LumensCommand["preset_set"] = "01043F01";
    LumensCommand["preset_recall"] = "01043F02";
    LumensCommand["image_mirror_on"] = "01046102";
    LumensCommand["image_mirror_off"] = "01046103";
    LumensCommand["image_flip_on"] = "01046602";
    LumensCommand["image_flip_off"] = "01046603";
    LumensCommand["focus_mode_auto"] = "01043802";
    LumensCommand["focus_mode_manual"] = "01043803";
    LumensCommand["motionless_preset_on"] = "01070102";
    LumensCommand["motionless_preset_off"] = "01070103";
    LumensCommand["init_position_last_mem"] = "0104756A00";
    LumensCommand["init_position_1st_preset"] = "0104756A01";
    LumensCommand["cam_name"] = "01CE";
})(LumensCommand || (LumensCommand = {}));
exports.LumensCommand = LumensCommand;
var LumensInquiryCommand;
(function (LumensInquiryCommand) {
    LumensInquiryCommand["not_set"] = "";
    LumensInquiryCommand["inq_power_status"] = "090400";
    LumensInquiryCommand["inq_system_status"] = "09040001";
    LumensInquiryCommand["inq_mirror"] = "090461";
    LumensInquiryCommand["inq_flip"] = "090466";
    LumensInquiryCommand["inq_focus_mode"] = "090438";
    LumensInquiryCommand["inq_motionless_preset"] = "090701";
    LumensInquiryCommand["inq_init_position"] = "0904756A";
    LumensInquiryCommand["inq_cam_name"] = "097ECE";
})(LumensInquiryCommand || (LumensInquiryCommand = {}));
class Camera {
    constructor(host = undefined) {
        this.defulatConfig = {
            camera_ip: '192.168.100.100',
            camera_addr: 1,
            camera_name: 'Camera01',
            mirror: 0,
            flip: 0,
            motionless_preset: 0,
            focus_mode: FocusMode.Auto,
            pan_speed: 8,
            tilt_speed: 8,
            zoom_speed: 5,
            focus_speed: 5,
            init_position: InitPosition.FirstPreset,
            preset: 0
        };
        this._payloadSequence = 0;
        this._connected = false;
        this._config = this.defulatConfig;
        if (host) {
            this._config.camera_ip = host;
        }
    }
    get payloadSequence() {
        return this._payloadSequence++;
    }
    get isConnected() {
        return this._connected;
    }
    getViscaSocket() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this._socket || this._socket.readyState !== 1) {
                    this.connectWebSocket().then((socket) => {
                        this._socket = socket;
                        resolve(this._socket);
                    }).catch((error) => {
                        reject(error);
                    });
                }
                else {
                    resolve(this._socket);
                }
            });
        });
    }
    connectWebSocket() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let webSocket = new WebSocket("ws://localhost:55260");
                webSocket.onopen = (event) => {
                    resolve(webSocket);
                };
                webSocket.onclose = (event) => {
                    reject(msgInitializeFailed);
                };
            });
        });
    }
    sendMessageToProxy(socket, buffer, inquiry) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!socket || socket.readyState != 1) {
                    reject(msgConnectionLost);
                    return;
                }
                clearTimeout(this._commandTimer);
                if (inquiry) {
                    this._commandTimer = setTimeout(() => {
                        reject();
                    }, 5000);
                }
                socket.send(JSON.stringify({
                    ip: this._config.camera_ip,
                    port: 52381,
                    data: buffer.toJSON().data
                }));
                socket.onmessage = (event) => {
                    clearTimeout(this._commandTimer);
                    resolve(event.data);
                };
                socket.onerror = (err) => {
                    clearTimeout(this._commandTimer);
                    reject(err);
                };
            });
        });
    }
    getDataBuffer(command, value) {
        if (!command)
            return undefined;
        let payloadType;
        if (Object.values(LumensCommand).includes(command)) {
            payloadType = '0100';
        }
        else if (Object.values(LumensInquiryCommand).includes(command)) {
            payloadType = '0110';
        }
        else {
            return undefined;
        }
        let payload = `8${this._config.camera_addr}`;
        switch (command) {
            case LumensCommand.zoom_tele_variable:
            case LumensCommand.zoom_wide_variable:
                payload += `${command}${this._config.zoom_speed}`;
                break;
            case LumensCommand.focus_near_variable:
            case LumensCommand.focus_far_variable:
                payload += `${command}${this._config.focus_speed}`;
                break;
            case LumensCommand.pan_tilt_stop:
            case LumensCommand.pan_tilt_up:
            case LumensCommand.pan_tilt_down:
            case LumensCommand.pan_tilt_left:
            case LumensCommand.pan_tilt_right:
                payload += `010601${this._config.pan_speed.toString().padStart(2, '0')}${this._config.tilt_speed.toString().padStart(2, '0')}${command}`;
                break;
            case LumensCommand.preset_set:
            case LumensCommand.preset_recall:
                payload += `${command}${this._config.preset.toString().padStart(2, '0')}`;
                break;
            case LumensCommand.cam_name:
                payload += `${command}${value === null || value === void 0 ? void 0 : value.toString('hex').padEnd(24, '0')}`;
                break;
            default:
                payload += command;
        }
        payload += 'FF';
        let data = `${payloadType}${(payload.length / 2).toString(16).padStart(4, '0')}${this.payloadSequence.toString().padStart(8, '0')}${payload}`;
        let buffer = Buffer.from(data, 'hex');
        return buffer;
    }
    parseInquiryResult(data) {
        let headerOffset = 8;
        var cameraAddr = this._config.camera_addr + 8;
        if (data[headerOffset] >> 4 !== cameraAddr)
            return null;
        if (data[headerOffset + 1] >> 4 !== 5)
            return null;
        return data.slice(headerOffset + 2, data.length - 1);
    }
    commandTimeout() {
        if (this.onEventChanged) {
            if (this._connected) {
                this.onEventChanged(CameraEvent.timeout, msgConnectionLost);
            }
            else {
                this.onEventChanged(CameraEvent.notFound, msgCameraNotFound);
            }
        }
        index_1.utils.setLoader(false);
    }
    /**
     * Public function
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            let powerStatus = yield this.getPowerStatus();
            // if (powerStatus === PowerStatus.Off) {
            //   this.powerOn()
            //   powerStatus = await this.getPowerStatus()
            // }
            this._connected = powerStatus === PowerStatus.On;
            if (this.onEventChanged) {
                if (this._connected) {
                    this.onEventChanged(CameraEvent.connected, undefined);
                }
                else {
                    this.onEventChanged(CameraEvent.notFound, msgCameraNotFound);
                }
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._socket) {
                yield this._socket.close();
            }
            this._connected = false;
        });
    }
    getPowerStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_power_status);
            let result = data ? data[0] : PowerStatus.Off;
            return result;
        });
    }
    getSystemStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.sendInqCommand(LumensInquiryCommand.inq_system_status);
            return true;
        });
    }
    getMirrorStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_mirror);
            let result = data ? data[0] : MirrorStatus.Off;
            return result;
        });
    }
    getFlipStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_flip);
            let result = data ? data[0] : FlipStatus.Off;
            return result;
        });
    }
    getFocusModeStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_focus_mode);
            let result = data ? data[0] : FocusMode.Auto;
            return result;
        });
    }
    getMotionlessPresetStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_motionless_preset);
            let result = data ? data[0] : MotionlessPreset.Off;
            return result;
        });
    }
    getInitPositionStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_init_position);
            let result = data ? data[0] : InitPosition.LastMem;
            return result;
        });
    }
    getCameraID() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_cam_name);
            var output = '';
            data && data.forEach(byte => {
                if (byte !== 0) {
                    output += String.fromCharCode(byte);
                }
            });
            return output;
        });
    }
    setCameraID(cameraName) {
        return __awaiter(this, void 0, void 0, function* () {
            var cameraNameCommand = Buffer.from(cameraName);
            let data = yield this.sendCommand(LumensCommand.cam_name, cameraNameCommand);
        });
    }
    powerOff() {
        this.sendCommand(LumensCommand.power_off);
    }
    powerOn() {
        this.sendCommand(LumensCommand.power_on);
    }
    loadConfig() {
        let config = localStorage.getItem('config');
        if (config) {
            let parsedConfig = JSON.parse(config);
            this._config.camera_ip = parsedConfig['camera_ip'];
            this._config.camera_addr = parsedConfig['camera_addr'],
                this._config.pan_speed = parsedConfig['pan_speed'],
                this._config.tilt_speed = parsedConfig['tilt_speed'],
                this._config.zoom_speed = parsedConfig['zoom_speed'],
                this._config.focus_speed = parsedConfig['focus_speed'];
        }
    }
    saveConfig() {
        let configToSave = {
            camera_ip: this._config.camera_ip,
            camera_addr: this._config.camera_addr,
            pan_speed: this._config.pan_speed,
            tilt_speed: this._config.tilt_speed,
            zoom_speed: this._config.zoom_speed,
            focus_speed: this._config.focus_speed
        };
        localStorage.setItem('config', JSON.stringify(configToSave));
    }
    /**
     * ICameraControl
     */
    sendCommand(command, value) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!this._connected && command !== LumensCommand.power_on) {
                if (this.onEventChanged)
                    this.onEventChanged(CameraEvent.notFound, msgCameraNotFound);
                reject(msgCameraNotFound);
                return;
            }
            let buffer = this.getDataBuffer(command, value);
            if (!buffer) {
                if (this.onEventChanged)
                    this.onEventChanged(CameraEvent.unknown, msgCameraNotFound);
                reject(msgCommandInvalid);
                return;
            }
            if (debugFlag)
                console.log(`Send command: ${buffer.toString('hex')}`);
            this.getViscaSocket().then(socket => {
                this.sendMessageToProxy(socket, buffer, true).then((result) => {
                    let jsonData = JSON.parse(result);
                    let data = jsonData['data'];
                    let dataBuffer = Buffer.from(data);
                    if (debugFlag)
                        console.log(`Receive data: ${dataBuffer.toString('hex')}`);
                    resolve(dataBuffer);
                }).catch((err) => {
                    this.commandTimeout();
                    reject(err);
                });
            }).catch((err) => {
                if (this.onEventChanged)
                    this.onEventChanged(CameraEvent.unknown, err);
                reject(err);
            });
        }));
    }
    sendInqCommand(command) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let buffer = this.getDataBuffer(command);
            if (!buffer) {
                reject(msgCommandInvalid);
                return;
            }
            if (debugFlag)
                console.log(`Send command: ${buffer.toString('hex')}`);
            this.getViscaSocket().then(socket => {
                this.sendMessageToProxy(socket, buffer, true).then((result) => {
                    let jsonData = JSON.parse(result);
                    let data = jsonData['data'];
                    let dataBuffer = Buffer.from(data);
                    if (debugFlag)
                        console.log(`Receive data: ${dataBuffer.toString('hex')}`);
                    var parsedResult = this.parseInquiryResult(data);
                    resolve(parsedResult);
                }).catch((err) => {
                    this.commandTimeout();
                    reject(err);
                });
            }).catch((err) => {
                if (this.onEventChanged)
                    this.onEventChanged(CameraEvent.unknown, msgInitializeFailed);
                reject(err);
            });
        }));
    }
}
exports.Camera = Camera;

}).call(this)}).call(this,require("buffer").Buffer)
},{"../index":4,"buffer":2}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
class Utils {
    constructor() {
        this._blocker = document.getElementById("blocker");
    }
    setLoader(isOn) {
        if (isOn) {
            this._blocker.style.display = "block";
        }
        else {
            this._blocker.style.display = "none";
        }
    }
    showAlert(message) {
        var _a;
        var alert = document.createElement("IFRAME");
        alert.setAttribute("src", 'data:text/plain,');
        document.documentElement.appendChild(alert);
        window.frames[0].window.alert(message);
        (_a = alert.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(alert);
    }
}
exports.Utils = Utils;

},{}],7:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.camera = void 0;
const Camera_1 = require("./lib/Camera");
const index_1 = require("./index");
Object.defineProperty(exports, "camera", { enumerable: true, get: function () { return index_1.camera; } });
document.addEventListener('DOMContentLoaded', () => {
    var _a, _b, _c;
    (_a = document.getElementById("cam_name_input")) === null || _a === void 0 ? void 0 : _a.addEventListener('input', (event) => {
        let element = event.target;
        let filters = [' ', '_', '/'];
        filters.forEach(filter => {
            if (element.value.includes(filter)) {
                element.value = element.value.replace(filter, "");
                index_1.utils.showAlert('The camera name with " ", "_" and "/" is not valid');
            }
        });
    });
    (_c = (_b = document.querySelector("#preference_modal")) === null || _b === void 0 ? void 0 : _b.querySelector(".close")) === null || _c === void 0 ? void 0 : _c.addEventListener('click', (event) => {
        loadPreference();
    });
    loadPreference();
    updateUI(false);
});
function loadPreference() {
    index_1.camera.loadConfig();
    if (!index_1.camera.isConnected) {
        document.getElementById("cam_ip_input").value = index_1.camera._config.camera_ip;
    }
    document.getElementById("cam_name").value = index_1.camera._config.camera_name;
    document.getElementById("cam_name_input").value = index_1.camera._config.camera_name;
    document.getElementById("pan_speed").value = String(index_1.camera._config.pan_speed);
    document.getElementById("tilt_speed").value = String(index_1.camera._config.tilt_speed);
    document.getElementById("focus_speed").value = String(index_1.camera._config.focus_speed);
    document.getElementById("zoom_speed").value = String(index_1.camera._config.zoom_speed);
}
function queryCameraConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        index_1.camera._config.mirror = Number(yield index_1.camera.getMirrorStatus());
        index_1.camera._config.flip = Number(yield index_1.camera.getFlipStatus());
        index_1.camera._config.focus_mode = Number(yield index_1.camera.getFocusModeStatus());
        index_1.camera._config.motionless_preset = Number(yield index_1.camera.getMotionlessPresetStatus());
        index_1.camera._config.init_position = Number(yield index_1.camera.getInitPositionStatus());
        index_1.camera._config.camera_name = String(yield index_1.camera.getCameraID());
        updateToggleButton(document.getElementById("mirror_button"), index_1.camera._config.mirror);
        updateToggleButton(document.getElementById("flip_button"), index_1.camera._config.flip);
        updateToggleButton(document.getElementById("focus_mode_button"), index_1.camera._config.focus_mode);
        updateToggleButton(document.getElementById("motionless_preset_button"), index_1.camera._config.motionless_preset);
        document.getElementById("init_position").value = String(index_1.camera._config.init_position);
        document.getElementById("cam_name_input").value = index_1.camera._config.camera_name;
        document.getElementById("cam_name").innerHTML = index_1.camera._config.camera_name;
    });
}
function updateUI(setEnable) {
    document.querySelectorAll(".form-control").forEach((element) => {
        if (setEnable) {
            element.classList.remove("disabled");
        }
        else {
            if (element.id === "cam_ip_input")
                return;
            element.classList.add("disabled");
        }
    });
    let mainControl = document.querySelector(".main-control");
    let presetButton = document.querySelector("#assign_preset");
    let ipInput = document.querySelector("#cam_ip_input");
    if (setEnable) {
        mainControl.classList.remove("disabled");
        presetButton.classList.remove("disabled");
        ipInput.classList.add("disabled");
    }
    else {
        mainControl.classList.add("disabled");
        presetButton.classList.add("disabled");
        ipInput.classList.remove("disabled");
    }
}
function updateToggleButton(target, value) {
    let isToggle = false;
    let controlCommand = null;
    let label = null;
    let newToggleValue = null;
    switch (target.id) {
        case "mirror_button":
            if (value) {
                isToggle = value === Camera_1.MirrorStatus.On;
            }
            else {
                isToggle = Number(target.getAttribute("data-toggle-value")) === Camera_1.MirrorStatus.Off;
                controlCommand = isToggle ? "image_mirror_on" : "image_mirror_off";
                index_1.camera._config.mirror = Number(isToggle);
            }
            label = `Mirror - ${isToggle ? "On" : "Off"}`;
            newToggleValue = isToggle ? String(Camera_1.MirrorStatus.On) : String(Camera_1.MirrorStatus.Off);
            break;
        case "flip_button":
            if (value) {
                isToggle = value === Camera_1.FlipStatus.On;
            }
            else {
                isToggle = Number(target.getAttribute("data-toggle-value")) === Camera_1.FlipStatus.Off;
                controlCommand = isToggle ? "image_flip_on" : "image_flip_off";
                index_1.camera._config.flip = Number(isToggle);
            }
            label = `Flip - ${isToggle ? "On" : "Off"}`;
            newToggleValue = isToggle ? String(Camera_1.FlipStatus.On) : String(Camera_1.FlipStatus.Off);
            break;
        case "motionless_preset_button":
            if (value) {
                isToggle = value === Camera_1.MotionlessPreset.On;
            }
            else {
                isToggle = Number(target.getAttribute("data-toggle-value")) === Camera_1.MotionlessPreset.Off;
                controlCommand = isToggle ? "motionless_preset_on" : "motionless_preset_off";
                index_1.camera._config.motionless_preset = Number(isToggle);
            }
            label = `Motionless Preset - ${isToggle ? "On" : "Off"}`;
            newToggleValue = isToggle ? String(Camera_1.MotionlessPreset.On) : String(Camera_1.MotionlessPreset.Off);
            break;
        case "focus_mode_button":
            if (value) {
                isToggle = value === Camera_1.FocusMode.Manual;
            }
            else {
                isToggle = Number(target.getAttribute("data-toggle-value")) === Camera_1.FocusMode.Auto;
                controlCommand = isToggle ? "focus_mode_manual" : "focus_mode_auto";
                index_1.camera._config.focus_mode = Number(isToggle);
            }
            label = `Focus - ${isToggle ? "Manual" : "Auto"}`;
            newToggleValue = isToggle ? String(Camera_1.FocusMode.Manual) : String(Camera_1.FocusMode.Auto);
            break;
    }
    function updateUI() {
        if (newToggleValue) {
            target.setAttribute("data-toggle-value", newToggleValue);
        }
        if (label) {
            target.innerHTML = label;
        }
    }
    if (controlCommand) {
        let command = controlCommand;
        index_1.camera.sendCommand(Camera_1.LumensCommand[command]).then((data) => {
            updateUI();
        });
    }
    else {
        updateUI();
    }
}
function updateConnectionUI(isConnect) {
    let statusLed = document.getElementById('status_led');
    if (isConnect) {
        statusLed.classList.add("status-on");
        updateUI(true);
    }
    else {
        statusLed.classList.remove("status-on");
        updateUI(false);
    }
}
(_a = document.getElementById('connect_btn')) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    let statusLed = document.getElementById('status_led');
    let isConnect = statusLed.classList.contains("status-on");
    index_1.camera.onEventChanged = (event, message) => {
        switch (event) {
            case Camera_1.CameraEvent.notFound:
            case Camera_1.CameraEvent.disconncted:
            case Camera_1.CameraEvent.timeout:
                if (message)
                    index_1.utils.showAlert(message);
                index_1.camera.disconnect();
                updateConnectionUI(false);
                break;
            case Camera_1.CameraEvent.unknown:
                if (message)
                    index_1.utils.showAlert(message);
            default:
                if (message)
                    console.log(message);
                break;
        }
    };
    index_1.utils.setLoader(true);
    if (!isConnect) {
        let ipAddr = (_d = document.getElementById("cam_ip_input")) === null || _d === void 0 ? void 0 : _d.value;
        index_1.camera._config.camera_ip = ipAddr;
        try {
            yield index_1.camera.connect();
            if (index_1.camera.isConnected) {
                yield queryCameraConfig();
                updateConnectionUI(true);
            }
        }
        finally {
            index_1.utils.setLoader(false);
        }
    }
    else {
        index_1.camera.disconnect();
        updateConnectionUI(false);
    }
    index_1.utils.setLoader(false);
}));
document.querySelectorAll('.toggle-button').forEach((item) => {
    item.addEventListener('click', (event) => {
        const target = event.target;
        updateToggleButton(target, null);
    });
});
(_b = document.getElementById('init_position')) === null || _b === void 0 ? void 0 : _b.addEventListener("change", (event) => {
    var _a;
    let initPosition = (_a = event.target) === null || _a === void 0 ? void 0 : _a.value;
    if (initPosition) {
        index_1.camera._config.init_position = Number(initPosition);
        if (index_1.camera._config.init_position === Camera_1.InitPosition.FirstPreset) {
            index_1.camera.sendCommand(Camera_1.LumensCommand.init_position_1st_preset);
        }
        else {
            index_1.camera.sendCommand(Camera_1.LumensCommand.init_position_last_mem);
        }
    }
});
(_c = document.getElementById("pref_save")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g, _h, _j, _k, _l, _m;
    if (!index_1.camera || !index_1.camera.isConnected)
        return;
    index_1.utils.setLoader(true);
    let cameraIp = (_f = (_e = document.getElementById("cam_ip_input")) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : "";
    index_1.camera._config.camera_ip = cameraIp;
    let cameraName = (_h = (_g = document.getElementById("cam_name_input")) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : "";
    yield index_1.camera.setCameraID(cameraName).then(() => {
        document.getElementById("cam_name").innerHTML = cameraName;
        index_1.camera._config.camera_name = cameraName;
    });
    let panSpeed = (_j = document.getElementById("pan_speed")) === null || _j === void 0 ? void 0 : _j.value;
    if (panSpeed) {
        index_1.camera._config.pan_speed = Number(panSpeed);
    }
    let tiltSpeed = (_k = document.getElementById("tilt_speed")) === null || _k === void 0 ? void 0 : _k.value;
    if (tiltSpeed) {
        index_1.camera._config.tilt_speed = Number(tiltSpeed);
    }
    let zoomSpeed = (_l = document.getElementById("zoom_speed")) === null || _l === void 0 ? void 0 : _l.value;
    if (zoomSpeed) {
        index_1.camera._config.zoom_speed = Number(zoomSpeed);
    }
    let focusSpeed = (_m = document.getElementById("focus_speed")) === null || _m === void 0 ? void 0 : _m.value;
    if (focusSpeed) {
        index_1.camera._config.focus_speed = Number(focusSpeed);
    }
    index_1.camera.saveConfig();
    index_1.utils.setLoader(false);
}));

},{"./index":4,"./lib/Camera":5}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camera = void 0;
const Camera_1 = require("./lib/Camera");
const preference_1 = require("./preference");
Object.defineProperty(exports, "camera", { enumerable: true, get: function () { return preference_1.camera; } });
const index_1 = require("./index");
let churchImages = [
    "Podium",
    "Podium Zoom",
    "2nd Podium",
    "Credence Table",
    "Credence Table Zoom",
    "Stage",
    "Church Pews",
    "Choir",
    "Church Band"
];
document.querySelectorAll(".preset-item").forEach((item) => {
    item.addEventListener("click", (event) => {
        if (!preference_1.camera)
            return;
        index_1.utils.setLoader(true);
        let target = event.target;
        let presetNum = target.getAttribute("data-preset");
        preference_1.camera._config.preset = Number(presetNum);
        preference_1.camera.sendCommand(Camera_1.LumensCommand.preset_set).then(() => {
            setTimeout(() => {
                index_1.utils.setLoader(false);
            }, 800);
        }).catch((err) => {
            var _a;
            let closeButton = (_a = document.querySelector("#preset_modal")) === null || _a === void 0 ? void 0 : _a.querySelector(".close");
            if (closeButton)
                closeButton.click();
        });
    });
});
document.querySelectorAll(".preset-recall-item").forEach((item) => {
    item.addEventListener("click", (event) => {
        if (!preference_1.camera)
            return;
        let target = event.target;
        let presetNum = target.getAttribute("data-preset");
        preference_1.camera._config.preset = Number(presetNum);
        preference_1.camera.sendCommand(Camera_1.LumensCommand.preset_recall);
    });
});

},{"./index":4,"./lib/Camera":5,"./preference":7}]},{},[4,7,8,5]);
