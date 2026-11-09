import { createSlice } from "@reduxjs/toolkit";

const uploadsSlice = createSlice({
  name: "uploads",
  initialState: {
    url: "",
  },
  reducers: {
    setImagen: (state, action) => {
      state.url = action.payload?.url || "";
    },
    resetImagen: (state) => {
      state.url = "";
    },
  },
});

export const { setImagen, resetImagen } = uploadsSlice.actions;
export default uploadsSlice.reducer;
