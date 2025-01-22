import Navbar from "react-bootstrap/Navbar";

export function App() {
  return (
    <>
      <header data-bs-theme="dark">
        <Navbar collapseOnSelect bg="dark-subtle" expand="md" className="px-3" data-bs-theme="dark">
          <Navbar.Brand className="fw-bold text-muted">CharityOps</Navbar.Brand>
          <Navbar.Toggle />
        </Navbar>
      </header>
      <main className="App container bg-dark text-light">
        <h1 className="text-center">Welcome to CharityOps</h1>
      </main>
    </>
  );
}
