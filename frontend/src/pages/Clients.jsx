import axios from "axios";
import { useEffect, useState } from "react";

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

  const user = JSON.parse(localStorage.getItem("user"));

  const [clients, setClients] = useState([]);

  const [open, setOpen] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
  });

  const [editIndex, setEditIndex] = useState(null);

  const [errors, setErrors] = useState({});

  // FETCH CLIENTS

  const fetchClients = async () => {

    try {

      const res = await axios.get(
        `http://localhost/backend/get_clients.php?user_id=${user.id}`
      );

      setClients(res.data);

    } catch (err) {

      console.log(err);
    }
  };

  useEffect(() => {

    fetchClients();

  }, []);

  // INPUT CHANGE

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // VALIDATION

  const validate = () => {

    let errors = {};

    if (!form.name || form.name.trim() === "") {
      errors.name = "Name is required";
    }

    if (!form.email) {

      errors.email = "Email is required";

    } else if (!form.email.includes("@")) {

      errors.email = "Enter valid email";
    }

    if (!form.phone) {

      errors.phone = "Phone is required";

    } else if (!/^\d{10}$/.test(form.phone)) {

      errors.phone = "Phone must be 10 digits";
    }

    if (!form.address || form.address.trim() === "") {

      errors.address = "Address is required";
    }

    if (!form.pincode) {

      errors.pincode = "Pincode required";

    } else if (!/^\d{6}$/.test(form.pincode)) {

      errors.pincode = "Must be 6 digits";
    }

    return errors;
  };

  // SUBMIT

  const handleSubmit = async () => {

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {

      setErrors(validationErrors);

      return;
    }

    try {

      let res;

      // UPDATE

      if (editIndex !== null) {

        res = await axios.post(
          "http://localhost/backend/update_client.php",
          {
            id: editIndex,
            user_id: user.id,
            ...form,
          }
        );

      } else {

        // ADD

        res = await axios.post(
          "http://localhost/backend/add_client.php",
          {
            user_id: user.id,
            ...form,
          }
        );
      }

      // BACKEND ERROR

      if (res.data.error) {

        setSubmitError(res.data.error);

        return;
      }

      // SUCCESS

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

      setSubmitError("");

      setEditIndex(null);

    } catch (err) {

      console.log(err);

      alert("Something went wrong");
    }
  };

  // DELETE

  const deleteClient = async (id) => {

    try {

      await axios.post(
        "http://localhost/backend/delete_client.php",
        {
          id,
          user_id: user.id,
        }
      );

      fetchClients();

    } catch (err) {

      console.log(err);
    }
  };

  // EDIT

  const editClient = (client) => {

    setForm(client);

    setEditIndex(client.id);

    setOpen(true);
  };

  return (

    <div>

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Clients
        </h1>

        <Dialog open={open} onOpenChange={setOpen}>

          <DialogTrigger asChild>

            <Button
              onClick={() => {

                setEditIndex(null);

                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  address: "",
                  pincode: "",
                });

                setErrors({});

                setSubmitError("");

                setOpen(true);
              }}
            >
              Add Client
            </Button>

          </DialogTrigger>

          <DialogContent>

            <DialogHeader>

              <DialogTitle>
                {editIndex !== null
                  ? "Edit Client"
                  : "Add Client"}
              </DialogTitle>

            </DialogHeader>

            <div className="flex flex-col gap-3">

              {/* NAME */}

              <input
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              {errors.name && (
                <p className="text-red-500 text-sm">
                  {errors.name}
                </p>
              )}

              {/* EMAIL */}

              <input
                name="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              {errors.email && (
                <p className="text-red-500 text-sm">
                  {errors.email}
                </p>
              )}

              {/* PHONE */}

              <input
                name="phone"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              {errors.phone && (
                <p className="text-red-500 text-sm">
                  {errors.phone}
                </p>
              )}

              {/* ADDRESS */}

              <input
                name="address"
                placeholder="Enter address"
                value={form.address}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              {errors.address && (
                <p className="text-red-500 text-sm">
                  {errors.address}
                </p>
              )}

              {/* PINCODE */}

              <input
                name="pincode"
                placeholder="Enter pincode"
                value={form.pincode}
                onChange={(e) => {

                  handleChange(e);

                  setSubmitError("");
                }}
                className="border p-2 rounded"
              />

              {errors.pincode && (
                <p className="text-red-500 text-sm">
                  {errors.pincode}
                </p>
              )}

              {/* BACKEND ERROR */}

              {submitError && (
                <p className="text-red-500 text-sm">
                  {submitError}
                </p>
              )}

              {/* BUTTON */}

              <button
                type="button"
                onClick={handleSubmit}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                {editIndex !== null
                  ? "Update"
                  : "Save"}
              </button>

            </div>

          </DialogContent>

        </Dialog>

      </div>

      {/* TABLE */}

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

            {clients.map((client) => (

              <TableRow key={client.id}>

                <TableCell>{client.name}</TableCell>

                <TableCell>{client.phone}</TableCell>

                <TableCell>{client.email}</TableCell>

                <TableCell>{client.address}</TableCell>

                <TableCell>{client.pincode}</TableCell>

                <TableCell className="flex gap-2">

                  {/* EDIT */}

                  <Button
                    onClick={() => editClient(client)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Edit
                  </Button>

                  {/* DELETE */}

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