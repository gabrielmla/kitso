
const UNAUTHORIZED_STATUS = 401;
const BAD_REQUEST_STATUS = 400;
const OK_STATUS = 200;

class RequestStatus {

    static get UNAUTHORIZED() {
        return UNAUTHORIZED_STATUS;
    }

    static get BAD_REQUEST() {
        return BAD_REQUEST_STATUS;
    }

    static get OK() {
        return OK_STATUS;
    }
}

module.exports = RequestStatus;