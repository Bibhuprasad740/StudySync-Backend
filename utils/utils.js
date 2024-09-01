exports.customComparator = (a, b) => {
    // if last revision is same
    if (a.lastRevised === b.lastRevised) {
        return a.id - b.id;
    }

    // different last revision
    if (a.lastRevised === '-1') {
        return -1; // a comes before b
    }

    if (b.lastRevised === '-1') {
        return 1; // b comes before a
    }

    // Extract the numerical date value and sort by it (older dates come first)
    const date1 = parseInt(a.lastRevised.split(' ')[0]);
    const date2 = parseInt(b.lastRevised.split(' ')[0]);

    return date2 - date1;
}