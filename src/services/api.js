import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://projectmanagementappapi.onrender.com/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: "Error desconocido" };
      }
      // Crear un error con más información
      const error = new Error(errorData.message || "Error en la solicitud");
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    return response.json();
  }

  async get(endpoint) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders();

    console.log("API Request:", {
      url,
      headers,
      method: "GET",
    });

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    console.log("API Response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    });

    return this.handleResponse(response);
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async put(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async patch(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PATCH",
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint, data = null) {
    const options = {
      method: "DELETE",
      headers: await this.getHeaders(),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, options);
    return this.handleResponse(response);
  }
}

export default new ApiService();
