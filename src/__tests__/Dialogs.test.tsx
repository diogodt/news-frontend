import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SaveDialog } from "../components/SaveDialog";
import { CollectionFormDialog } from "../components/CollectionFormDialog";

describe("SaveDialog", () => {
  it("saves to existing collection", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(
      <SaveDialog
        open
        onClose={() => {}}
        collections={[{ id: 1, name: "C1", articles: [] }]}
        onCreateCollection={jest.fn()}
        onSave={onSave}
      />
    );
    await userEvent.selectOptions(screen.getByLabelText(/Choose an existing collection/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /^Save$/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(1));
  });

  it("creates and saves new collection", async () => {
    const onCreate = jest.fn().mockResolvedValue({ id: 2, name: "New", articles: [] });
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<SaveDialog open onClose={() => {}} collections={[]} onCreateCollection={onCreate} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText(/New collection name/i), { target: { value: "New" } });
    fireEvent.click(screen.getByRole("button", { name: /Create & save/i }));
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(2));
  });

  it("ignores create when name empty", async () => {
    const onCreate = jest.fn();
    const onSave = jest.fn();
    render(<SaveDialog open onClose={() => {}} collections={[]} onCreateCollection={onCreate} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: /Create & save/i }));
    await waitFor(() => expect(onCreate).not.toHaveBeenCalled());
  });
});

describe("CollectionFormDialog", () => {
  it("submits updated name", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <CollectionFormDialog
        open
        title="Edit"
        initialName="Old"
        initialDescription="Desc"
        onClose={() => {}}
        onSubmit={onSubmit}
      />
    );
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "New Name" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: "New Name", description: "Desc" }));
  });

  it("ignores submit when name empty", async () => {
    const onSubmit = jest.fn();
    render(<CollectionFormDialog open title="New" onClose={() => {}} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });
});
