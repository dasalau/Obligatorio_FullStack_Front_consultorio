import { createSlice } from "@reduxjs/toolkit";

const groqSlice = createSlice({
  name: "groq",
  initialState: {
    respuesta: "",
  },
  reducers: {
    setRespuesta: (state, action) => {
      const payload = action.payload;

      state.respuesta =
        payload?.mensaje ||
        payload?.content ||
        payload?.answer ||
        payload?.choices?.[0]?.message?.content ||
        "";
    },
  },
});

export const { setRespuesta } = groqSlice.actions;
export default groqSlice.reducer;
