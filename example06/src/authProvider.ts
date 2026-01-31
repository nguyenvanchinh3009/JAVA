import axios from 'axios';

interface LoginParams {
    username: string;
    password: string;
}
interface CheckParamsErr {
    status: number;
}
export const authProvider = {
    // Được gọi khi người dùng đăng nhập
    login: async ({ username, password }: LoginParams) => {
        try {
            const response = await axios.post('http://localhost:8080/api/login', {
                email: username,
                password: password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            });
            const token = response.data["jwt-token"];
            if (token) {
                localStorage.setItem("jwt-token", token);
                localStorage.setItem("username", username);
                localStorage.setItem("password", password);

            } else {
                return Promise.reject(new Error("No token received"));
            }

            const userResponse = await axios.get(`http://localhost:8080/api/public/users/email/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const cartId = userResponse.data.cart.cartId;
            localStorage.setItem("cartId", cartId);

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(new Error("Sai tài khoản hoặc mật khẩu. Vui lòng thử lại"));
        }
    },

    // Được gọi khi người dùng nhấp vào nút đăng xuất
    logout: () => {
        localStorage.removeItem("username");
        localStorage.removeItem("jwt-token");
        return Promise.resolve();
    },

    // Được gọi khi API trả về lỗi
    checkError: ({ status }: CheckParamsErr) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem("username");
            localStorage.removeItem("jwt-token");
            return Promise.reject();
        }
        return Promise.resolve();
    },

    // Được gọi khi người dùng điều hướng đến một vị trí mới, để kiểm tra xác thực
    checkAuth: () => {
        return localStorage.getItem("jwt-token") ? Promise.resolve() : Promise.reject();
    },

    // Được gọi khi người dùng điều hướng đến một vị trí mới, để kiểm tra quyền / vai trò
    getPermissions: () => Promise.resolve(),
};