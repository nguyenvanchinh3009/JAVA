import axios from "axios";
import {
  CreateParams,
  CreateResult,
  DataProvider,
  DeleteManyParams,
  DeleteManyResult,
  DeleteParams,
  DeleteResult,
  GetManyParams,
  GetManyReferenceParams,
  GetManyReferenceResult,
  GetManyResult,
  GetOneParams,
  GetOneResult,
  GetListParams,
  // Identifier,
  QueryFunctionContext,
  RaRecord,
  UpdateManyParams,
  UpdateManyResult,
  UpdateParams,
  UpdateResult,
} from "react-admin";

const apiUrl = "http://localhost:8080/api";

const httpClient = {
  get: async (url: string) => {
    const token = localStorage.getItem("jwt-token");
    console.log("Token sent in GET:", token);
    return await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then((response) => ({ json: response.data }))
      .catch((error) => {
        console.error("API request failed:", error);
        throw error;
      });
  },
  post: async (url: string, data: any) => {
    const token = localStorage.getItem("jwt-token");
    console.log("Token sent in POST:", token);
    return await axios
      .post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then((response) => ({ json: response.data }))
      .catch((error) => {
        console.error("API request failed:", error);
        throw error;
      });
  },
  put: async (url: string, data: any) => {
    const token = localStorage.getItem("jwt-token");
    return await axios
      .put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then((response) => ({ json: response.data }))
      .catch((error) => {
        console.error("API request failed:", error);
        throw error;
      });
  },
  delete: async (url: string, p0: { data: { ids: any[] } }) => {
    const token = localStorage.getItem("jwt-token");

    return await axios
      .delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then((response) => ({ json: response.data }))
      .catch((error) => {
        console.error("API request failed:", error);
        throw error;
      });
  },
};

export const dataProvider: DataProvider = {
  getList: async (resource: string, params: GetListParams) => {
    console.log('getList', resource, params);
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    // Convert field names
    let sortBy = field;
    if (field === 'id') {
      sortBy = resource === 'users' ? 'userId' : 'id';
    }

    // Adjust page number since backend uses 0-based indexing
    const pageNumber = page - 1;

    const query = {
      pageNumber: pageNumber.toString(),
      pageSize: perPage.toString(),
      sortBy: sortBy,
      sortOrder: order.toLowerCase(),
    };

    let url: string;

    // Logic cho users
    if (resource === "users") {
      // Kiểm tra nếu là POST thì sử dụng endpoint register
      if (params.filter && params.filter.method === 'POST') {
        url = `${apiUrl}/register`; // Endpoint cho việc đăng ký
      } else {
        url = `${apiUrl}/admin/users?${new URLSearchParams(query).toString()}`; // Endpoint cho việc lấy danh sách người dùng
      }

      console.log('Making users request to:', url);
      const result = await httpClient.get(url);
      console.log('Users response:', result.json);
      const data = result.json.content.map((item: any) => ({
        id: item.userId,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        mobileNumber: item.mobileNumber,
        roles: item.roles,
        address: item.address,
        cart: item.cart
      }));
      console.log('Mapped user data:', data);
      return {
        data,
        total: result.json.totalElements
      };
    }
    // Logic cho categories
    else if (resource === "categories") {
      url = `${apiUrl}/public/categories?pageNumber=0&pageSize=100`; // Lấy tất cả danh mục
      const result = await httpClient.get(url);
      return {
        data: result.json.content.map((category: any) => ({
          id: category.categoryId, // ID cho mỗi category
          name: category.categoryName, // Tên category
        })),
        total: result.json.totalElements, // Tổng số category
      };
    }
    // Logic cho tìm kiếm theo từ khóa
    else if (params.filter && params.filter.search) {
      const keyword = params.filter.search;
      delete params.filter.search;
      url = `${apiUrl}/public/${resource}/keyword/${encodeURIComponent(keyword)}?${new URLSearchParams(query).toString()}`;
    }
    // Logic cho lọc theo categoryId
    else if (params.filter && params.filter.categoryId) {
      const categoryId = params.filter.categoryId;
      delete params.filter.categoryId;
      url = `${apiUrl}/public/categories/${categoryId}/${resource}?${new URLSearchParams(query).toString()}`;
    }
    // Logic cho các resource khác
    else {
      if (resource === "carts") {
        url = `${apiUrl}/admin/${resource}`;
      } else if (resource === "products") {
        url = `${apiUrl}/public/${resource}?${new URLSearchParams(query).toString()}`;
      } else {
        url = `${apiUrl}/admin/${resource}?${new URLSearchParams(query).toString()}`;
      }
    }

    // Gọi API và xử lý phản hồi cho các resource khác
    const result = await httpClient.get(url);
    const baseUrl = 'http://localhost:8080/api/public/products/image/';
    let data = [];
    let total = 0;

    if (result.json) {
      // Kiểm tra xem response có phải là mảng không
      if (Array.isArray(result.json)) {
        // Xử lý khi response là mảng (ví dụ: /api/admin/carts)
        data = result.json.map((item: any) => ({
          id: item.cartId, // Sử dụng cartId cho resource carts
          totalPrice: item.totalPrice,
          products: item.products
        }));
        total = data.length;
      } else if (result.json.content) {
        // Xử lý khi response có thuộc tính content
        data = result.json.content.map((item: { [x: string]: any; image: any; }) => ({
          id: resource === 'users' ? item.userId : item.productId,
          ...item,
          image: item.image ? `${baseUrl}${item.image}` : null
        }));
        total = result.json.totalElements || data.length;
      } else {
        console.error('Unexpected response structure:', result.json);
      }
    }

    return {
      data,
      total
    };
  },

  delete: async <RecordType extends RaRecord = any>(
    resource: string,
    params: DeleteParams<RecordType>
  ): Promise<DeleteResult<RecordType>> => {
    try {
      const url = `${apiUrl}/admin/${resource}/${params.id}`;
      await httpClient.delete(url, {
        data: {
          ids: [params.id],
        },
      });
      return {
        data: params.previousData as RecordType,
      };
    } catch (error) {
      console.error("API request failed:", error);
      throw new Error("Error deleting record");
    }
  },

  deleteMany: async <RecordType extends RaRecord = any>(
    resource: string,
    params: DeleteManyParams
  ): Promise<DeleteManyResult<RecordType>> => {
    const { ids } = params;
    try {
      const deletePromises = ids.map((id) => {
        const url = `${apiUrl}/admin/${resource}/${id}`;
        return httpClient.delete(url, {
          data: {
            ids: [id],
          },
        });
      });
      await Promise.all(deletePromises);
      return {
        data: ids,
      };
    } catch (error) {
      console.error("API request failed:", error);
      throw new Error("Error deleting records");
    }
  },

  getManyReference: function <RecordType extends RaRecord = any>(
    resource: string,
    params: GetManyReferenceParams & QueryFunctionContext
  ): Promise<GetManyReferenceResult<RecordType>> {
    throw new Error("Function not implemented.");
  },

  updateMany: function <RecordType extends RaRecord = any>(
    resource: string,
    params: UpdateManyParams
  ): Promise<UpdateManyResult<RecordType>> {
    throw new Error("Function not implemented.");
  },

  create: async (
    resource: string,
    params: CreateParams
  ): Promise<CreateResult> => {
    try {
      let url: string;

      if (resource === "products") {
        url = `${apiUrl}/admin/categories/${params.data.categoryId}/products`;
      } else {
        url = `${apiUrl}/admin/${resource}`;
      }

      // ✅ TÁCH DATA – KHÔNG MUTATE PARAMS
      const { categoryId, image, ...dataWithoutImage } = params.data;

      console.log("SEND TO BACKEND:", dataWithoutImage);

      const result = await httpClient.post(url, dataWithoutImage);

      return {
        data: {
          ...dataWithoutImage,
          id: result.json.productId || result.json.id,
        },
      };
    } catch (error) {
      console.error("Error creating resource:", error);
      throw error;
    }
  },


  update: async (
    resource: string,
    params: UpdateParams
  ): Promise<UpdateResult> => {
    const url = `${apiUrl}/admin/${resource}/${params.id}`;
    const { data } = params;
    const result = await httpClient.put(url, data);
    const updatedData = {
      id: params.id,
      ...result.json,
    };
    return { data: updatedData };
  },

  getOne: async (resource: string, params: GetOneParams): Promise<GetOneResult> => {
    console.log('getOne called for resource:', resource, 'with params:', params);
    let url: string;
    if (resource === "carts") {
      url = `${apiUrl}/public/user/${params.meta.email}/${resource}/${params.id}`;
    } else {
      url = `${apiUrl}/public/${resource}/${params.id}`;
    }
    const result = await httpClient.get(url);

    console.log('API Response:', result.json);

    const idFieldMapping: { [key: string]: string } = {
      products: 'productId',
      categories: 'categoryId',
      carts: 'cartId',
      // Add more mappings as needed
    }; const idField = idFieldMapping[resource] || 'id';
    const baseUrl = 'http://localhost:8080/api/public/products/image/'; // Base URL for product images
    let data;
    // Format the cart data
    if (resource === "carts") {
      data = {
        id: result.json.cartId,
        totalPrice: result.json.totalPrice,
        products: result.json.products.map((product: any) => ({
          id: product.productId,
          productName: product.productName,
          image: product.image ? `${baseUrl}${product.image}` : null,
          description: product.description,
          quantity: product.quantity,
          price: product.price,
          discount: product.discount,
          specialPrice: product.specialPrice,

          // ✅ GIỮ NGUYÊN
          categoryId: product.categoryId,
          categoryName: product.categoryName,
        })),
      };
    }

    else {
      data = {
        id: result.json[idField],
        ...result.json
      };
    }
    return { data };
  },

  getMany: async (
    resource: string,
    params: GetManyParams
  ): Promise<GetManyResult> => {
    const idFieldMapping: { [key: string]: string } = {
      products: "productId",
      categories: "categoryId",
    };
    console.log("Request resource:", resource);
    console.log("Request params:", params);
    const idField = idFieldMapping[resource] || "id";
    const ids = params.ids.join(",");
    let url: string;
    if (resource === "products") {
      url = `${apiUrl}/public/categories/${ids}/${resource}`;
    } else {
      url = `${apiUrl}/public/${resource}`;
    }
    console.log("Request URL getMany:", url);
    const result = await httpClient.get(url);
    const data = result.json.content.map((item: any) => ({
      id: item[idField],
      ...item,
    }));
    return { data };
  },
};