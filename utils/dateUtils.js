// incoming date is the data of updation and referenced date is the date from which we are calculating the difference
exports.dateDifference = (incomingDate, referencedDate = new Date()) => {
    incomingDate = new Date(incomingDate);
    const differenceInMilliseconds = referencedDate.getTime() - incomingDate.getTime();
    const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));

    return differenceInDays;
}

exports.formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}