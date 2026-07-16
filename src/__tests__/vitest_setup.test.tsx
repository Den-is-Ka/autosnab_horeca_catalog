import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Vitest setup", () => {
  it("поддерживает React, jsdom и jest-dom", () => {
    render(
      <button type="button" disabled>
        Проверка тестов
      </button>,
    );

    const button = screen.getByRole("button", {
      name: "Проверка тестов",
    });

    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
