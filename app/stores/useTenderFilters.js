import { create } from "zustand";

// create new store, filters (state), setFilter (action to update state)
// set is a function provided by Zustand to update the state. It accepts a function that takes the current state (state) as an argument and returns a new state.
const useTenderFilters = create((set) => ({
  filters: {
    category: "",
    department: "",
    province: "",
    description: "",
  },
  setFilter: (name, value) =>
    set((state) => ({
      filters: { ...state.filters, [name]: value },
    })),
}));

export default useTenderFilters;

// Zustand allows for a more organized, scalable, and maintainable state management solution, particularly when dealing with global state or complex data that needs to persist across sessions.
// 	1.	Centralized State Management: Zustand allows you to store the filter state globally, making it accessible across different components without prop drilling. This reduces redundancy and ensures consistency in the app’s state.
// 	2.	Separation of Concerns: Keeping the logic for managing filters in a separate store file helps keep the component focused on its primary responsibility—rendering UI. The state management logic stays isolated and reusable.
// 	3.	Easier Persistence: Zustand easily integrates with middleware like persist, making it straightforward to persist state (e.g., filters) across sessions, even after a page reload, without extra effort.
// 	4.	Scalability: As your app grows, Zustand can handle more complex state management needs, making it easier to scale and manage states in a clean and maintainable way.
