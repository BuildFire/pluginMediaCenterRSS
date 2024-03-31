const utils = {
    // Deep comparison using a simple recursive approach
    checkEquality: function (obj1, obj2) {
        // Check if both are objects
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
            return obj1 === obj2;
        }

        // Check if they have the same properties
        const obj1Props = Object.getOwnPropertyNames(obj1);
        const obj2Props = Object.getOwnPropertyNames(obj2);

        if (obj1Props.length !== obj2Props.length) {
            return false;
        }

        for (let i = 0; i < obj1Props.length; i++) {
            const propName = obj1Props[i];

            if (!obj2.hasOwnProperty(propName)) {
                return false;
            }

            // Recursively check nested objects
            if (!utils.checkEquality(obj1[propName], obj2[propName])) {
                return false;
            }
        }

        return true;
    }
}