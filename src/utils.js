const { parseType, parsedTypeCheck } = require('type-check');

// https://webbjocke.com/javascript-check-data-types/
function checkParamOrThrow(value, name, type, errorMessage) {
    // const INVALID_PARAMETER_ERROR_TYPE = isApiV1 ? INVALID_PARAMETER_ERROR_TYPE_V1 : INVALID_PARAMETER_ERROR_TYPE_V2;

    if (!errorMessage) errorMessage = `Parameter "${name}" must be provided of type ${type}`;

    const allowedTypes = parseType(type);

    // // This is workaround since Buffer doesn't seem to be possible to define using options.customTypes.
    // const allowsBuffer = allowedTypes.filter(item => item.type === 'Buffer').length;
    // const allowsFunction = allowedTypes.filter(item => item.type === 'Function').length;
    //
    // if (allowsBuffer && Buffer.isBuffer(value)) return;
    // if (allowsFunction && _.isFunction(value)) return;

    // This will ignore Buffer type.
    if (!parsedTypeCheck(allowedTypes, value)) {
        throw new Error(errorMessage);
    }
};

module.exports = {
  checkParamOrThrow
}
