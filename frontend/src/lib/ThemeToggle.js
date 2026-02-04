import { useEffect, useState } from "react";
import { LuMoon } from "react-icons/lu";
import { IoIosSunny } from "react-icons/io";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme.toLowerCase() : "light";
  });

  useEffect(() => {
    if (!theme) return;

    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button onClick={toggleTheme}>
      {theme === "light" ? (
        <LuMoon className="text-3xl" />
      ) : (
        <IoIosSunny className="text-3xl text-orange-500" />
      )}
    </button>
  );
};

export default ThemeToggle;
  