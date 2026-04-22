import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function Clients() {
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get("http://localhost/backend/get_clients.php");
      setClients(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let errors = {};

    if (!form.name) errors.name = "Name is required";

    if (!form.email) {
      errors.email = "Email is required";
    } else if (!form.email.includes("@")) {
      errors.email = "Enter valid email";
    }

    if (!form.phone) {
      errors.phone = "Phone is required";
    } else if (form.phone.length !== 10) {
      errors.phone = "Phone must be 10 digits";
    }

    if (!form.address) errors.address = "Address is required";

    if (!form.pincode) {
      errors.pincode = "Pincode required";
    } else if (form.pincode.length !== 6) {
      errors.pincode = "Must be 6 digits";
    }

    return errors;
  };

  const handleSubmit = async () => {
    console.log(form);

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.pincode
    ) {
      return;
    }

    try {
      if (editIndex !== null) {
        await axios.post("http://localhost/backend/update_client.php", {
          id: editIndex,
          ...form,
        });
      } else {
        await axios.post("http://localhost/backend/add_client.php", form);
      }

      fetchClients();
      setOpen(false);

      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        pincode: "",
      });

      setErrors({});
      setEditIndex(null);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteClient = async (id) => {
    try {
      await axios.post("http://localhost/backend/delete_client.php", { id });

      fetchClients(); // reload data from DB
    } catch (err) {
      console.log(err);
    }
  };

  const editClient = (client) => {
    setForm(client);
    setEditIndex(client.id);
    setOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditIndex(null); // reset edit mode
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  address: "",
                  pincode: "",
                });
                setOpen(true);
              }}
            >
              Add Client
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editIndex !== null ? "Edit Client" : "Add Client"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <input
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}

              <input
                name="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}

              <input
                name="phone"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}

              <input
                name="address"
                placeholder="Enter address"
                value={form.address}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address}</p>
              )}

              <input
                name="pincode"
                placeholder="Enter pincode"
                value={form.pincode}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              {errors.pincode && (
                <p className="text-red-500 text-sm">{errors.pincode}</p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                {editIndex !== null ? "Update" : "Save"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Pincode</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clients.map((client, index) => (
              <TableRow key={index}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>{client.pincode}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    onClick={() => editClient(client)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Edit
                  </Button>

                  <Button
                    onClick={() => deleteClient(client.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Clients;
