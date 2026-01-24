export const validateEmail = (email) => {
    if (!email) return "Email is required"

    const regex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // return regex.test(email.trim())
    if (!regex.test(email.trim())) return "Please enter a valid email address."
    return ""
}

export const validatePassword = (password) => {
    if (!password) return "Password is required"

    // Minimum 8 characters
    // At least 1 uppercase
    // At least 1 lowercase
    // At least 1 number
    // At least 1 special character
    const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    // return regex.test(password)
    if (!regex.test(password)) return "Minimum 8 characters with at least 1 uppercase, lowercase, number and special character."

    return "";
}

export const validateAvatar = (file) => {
    if(file) return "";

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if(!allowedTypes.includes(file.type)) {
        return "File must be supported"
    }

    const maxSize = 5 * 1024 * 1024;  // 5 MB
    if(file.size > maxSize) {
        return "File must be less than 5 MB";
    }

    return "";
}