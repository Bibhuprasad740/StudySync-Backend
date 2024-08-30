const Errors = {
    SIGN_UP_ERROR: {
        message: 'Failed to create user',
        status: 400,
    },
    SIGN_IN_ERROR: {
        message: 'Failed to authenticate user',
        status: 401,
    },
    INCORRECT_PASSWORD_ERROR: {
        message: 'Incorrect password',
        status: 401,
    },
    USER_NOT_FOUND_ERROR: {
        message: 'User not found',
        status: 404,
    },
    MIS_MATCH_TOKEN_ERROR: {
        message: 'Mismatched token',
        status: 401,
    },
    INVALID_TOKEN_ERROR: {
        message: 'Invalid token',
        status: 401,
    },
    PURCHASE_HISTORY_NOT_FOUND_ERROR: {
        message: 'Purchase history not found',
        status: 404,
    },
    LIMIT_REACHED_ERROR: {
        message: 'Daily study limit reached',
        status: 403,
    },
    ACCOUNT_LOCKED_ERROR: {
        message: 'User account is locked',
        status: 403,
    },
    PURCHASE_FORGERY_ERROR: {
        message: 'Purchase token forgery detected',
        status: 403,
    },
    INVALID_ADMIN: {
        message: 'Invalid admin',
        status: 403,
    },
    ACCESS_DENIED: {
        message: 'Access denied',
        status: 403,
    },
    TOKEN_EXPIRED_ERROR: {
        message: 'Token expired',
        status: 401,
    },
    FORGOT_PASSWORD_TOKEN_EXPIRED_ERROR: {
        message: 'Password reset token expired',
        status: 401,
    },
    SERVER_ERROR: {
        message: 'Internal server error',
        status: 500,
    },
    INVALID_REQUEST_ERROR: {
        message: 'Invalid request',
        status: 400,    
    }
}

module.exports = Errors;