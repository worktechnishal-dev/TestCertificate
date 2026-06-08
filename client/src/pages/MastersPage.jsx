import { useEffect, useState } from "react";
import api from "../services/api";

const emptyCustomer = { name: "", address: "" };

const MastersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [editingCustomerId, setEditingCustomerId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customerStatus, setCustomerStatus] = useState("");

  const loadCustomers = async () => {
    const { data } = await api.get("/customers");
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openAddDialog = () => {
    setCustomerForm(emptyCustomer);
    setEditingCustomerId("");
    setCustomerStatus("");
    setIsDialogOpen(true);
  };

  const editCustomer = (customer) => {
    setCustomerForm({
      name: customer.name || "",
      address: customer.address || ""
    });
    setEditingCustomerId(customer._id);
    setCustomerStatus("");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setCustomerForm(emptyCustomer);
    setEditingCustomerId("");
    setIsDialogOpen(false);
  };

  const saveCustomer = async (event) => {
    event.preventDefault();
    try {
      setCustomerStatus("");
      const payload = {
        name: customerForm.name.trim(),
        address: customerForm.address.trim()
      };

      if (editingCustomerId) {
        await api.put(`/customers/${editingCustomerId}`, payload);
        setCustomerStatus("Customer updated");
      } else {
        await api.post("/customers", payload);
        setCustomerStatus("Customer added");
      }

      closeDialog();
      await loadCustomers();
    } catch (error) {
      setCustomerStatus(error.response?.data?.error || error.response?.data?.message || error.message || "Failed to save customer");
    }
  };

  const deleteCustomer = async (customer) => {
    if (!window.confirm(`Delete ${customer.name}?`)) return;
    try {
      await api.delete(`/customers/${customer._id}`);
      setCustomerStatus("Customer deleted");
      await loadCustomers();
    } catch (error) {
      setCustomerStatus(error.response?.data?.message || error.message || "Failed to delete customer");
    }
  };

  return (
    <div className="page-grid">
      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Customer Master</p>
            <h2>Saved Customers</h2>
          </div>
          <button type="button" className="button" onClick={openAddDialog}>Add Customer</button>
        </div>

        {customerStatus && <p className="status-text">{customerStatus}</p>}

        <div className="data-table customer-table" role="table" aria-label="Customers">
          <div className="data-table__row data-table__row--head customer-table__row" role="row">
            <span role="columnheader">Customer Name</span>
            <span role="columnheader">Address</span>
            <span role="columnheader">Actions</span>
          </div>
          {customers.map((customer) => (
            <div key={customer._id} className="data-table__row customer-table__row" role="row">
              <span role="cell" className="truncate-cell" title={customer.name}><strong>{customer.name}</strong></span>
              <span role="cell" className="truncate-cell" title={customer.address || "No address"}>{customer.address || "No address"}</span>
              <span role="cell" className="button-row">
                <button type="button" className="button-secondary" onClick={() => editCustomer(customer)}>Edit</button>
                <button type="button" className="button-secondary danger" onClick={() => deleteCustomer(customer)}>Delete</button>
              </span>
            </div>
          ))}
          {!customers.length && <div className="data-table__empty">No customers added yet.</div>}
        </div>
      </section>

      {isDialogOpen && (
        <div className="dialog-backdrop" role="presentation">
          <section className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="customer-dialog-title">
            <div className="section-header">
              <div>
                <p className="eyebrow">Customer Master</p>
                <h2 id="customer-dialog-title">{editingCustomerId ? "Update Customer" : "Add Customer"}</h2>
              </div>
              <button type="button" className="button-secondary" onClick={closeDialog}>Close</button>
            </div>

            <form className="form-grid" onSubmit={saveCustomer}>
              <div className="field"><label>Name</label><input value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} required /></div>
              <div className="field field-span"><label>Address</label><input value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} /></div>
              <div className="button-row field-span">
                <button type="submit" className="button">{editingCustomerId ? "Update Customer" : "Save Customer"}</button>
                <button type="button" className="button-secondary" onClick={closeDialog}>Cancel</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default MastersPage;
