const APIErrorHandler = (res, error, errorMessage = null) => {
    const { message, status } = error;
    if(errorMessage) {
        console.log(errorMessage);
    }
    console.log(message, status);

    switch (error) {
        // to be added
        default: return res.status(status).json({ message: message + (errorMessage ? ' ' + errorMessage : '') });
    }
}

module.exports = APIErrorHandler;