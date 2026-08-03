import React, { useEffect, useState } from "react";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    Plus,
    Search,
    X,
    Save,
    Loader2,
    ShieldCheck,
    Pill,
    WalletCards
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../axios";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from '../components/Pagination';


const roleOptions = [
    {
        value: "admin",
        label: "Admin"
    },
    {
        value: "pharmacist",
        label: "Pharmacist"
    },
    {
        value: "cashier",
        label: "Cashier"
    }
];



export default function Users(){

    const { user: currentUser } = useAuth();


    const [users,setUsers] = useState([]);

    const [loading,setLoading] = useState(true);

    const [error,setError] = useState("");

    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);

    const [search,setSearch] = useState("");

    const [roleFilter,setRoleFilter] = useState("all");


    const [showModal,setShowModal] = useState(false);

    const [editingUser,setEditingUser] = useState(null);


    const [submitting,setSubmitting] = useState(false);



    const [showPassword,setShowPassword] = useState(false);

    const [showConfirm,setShowConfirm] = useState(false);



    const [form,setForm] = useState({

        name:"",
        email:"",
        password:"",
        password_confirmation:"",
        role:"cashier"

    });





    useEffect(()=>{

        fetchUsers();

    },[]);

    const handlePageChange = (p) => setPage(p);





    const fetchUsers = async()=>{

        try{

            const response = await api.get("/users", { params: { page, search: search, role: roleFilter } });

            setUsers(response.data.data || response.data);
            setMeta(response.data.meta || null);

            setError("");

        }

        catch(error){

            console.log(error);

            setError("Failed to load users");

        }

        finally{

            setLoading(false);

        }

    };

    useEffect(() => { setPage(1); }, [search, roleFilter]);
    useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);






    const handleChange=(e)=>{

        setForm({

            ...form,

            [e.target.name]:e.target.value

        });

    };






    const resetForm=()=>{


        setForm({

            name:"",
            email:"",
            password:"",
            password_confirmation:"",
            role:"cashier"

        });


        setEditingUser(null);

        setShowPassword(false);

        setShowConfirm(false);

    };






    const openCreate=()=>{

        resetForm();

        setShowModal(true);

    };






    const openEdit=(user)=>{


        setForm({

            name:user.name,

            email:user.email,

            password:"",

            password_confirmation:"",

            role:user.role

        });


        setEditingUser(user);

        setShowModal(true);


    };







    const closeModal=()=>{

        setShowModal(false);

        resetForm();

    };






    const handleSubmit=async(e)=>{

        e.preventDefault();


        setSubmitting(true);



        try{


            if(editingUser){


                await api.put(
                    `/users/${editingUser.id}`,
                    form
                );


            }

            else{


                await api.post(
                    "/register",
                    form
                );


            }



            await fetchUsers();


            closeModal();


        }


        catch(error){


            const messages =
            error.response?.data?.errors;


            setError(

                messages
                ?
                Object.values(messages)
                .flat()
                .join(" ")
                :
                "Operation failed"

            );


        }


        finally{


            setSubmitting(false);


        }


    };






    const handleDelete=async(id)=>{


        if(!window.confirm("Delete this user?"))
            return;



        try{


            await api.delete(`/users/${id}`);


            fetchUsers();


        }

        catch(error){

            setError("Failed to delete user");

        }


    };






    const filteredUsers = users;





    const totalUsers = meta?.total || users.length;


    const adminCount =
    users.filter(
        user=>user.role==="admin"
    ).length;


    const pharmacistCount =
    users.filter(
        user=>user.role==="pharmacist"
    ).length;


    const cashierCount =
    users.filter(
        user=>user.role==="cashier"
    ).length;





    const getRoleBadge=(role)=>{


        const styles={

            admin:
            "bg-sky-100 text-sky-700",

            pharmacist:
            "bg-sky-100 text-sky-700",

            cashier:
            "bg-sky-100 text-sky-700"

        };



        return (

            <span
            className={`
            px-3
            py-1
            rounded-full
            text-xs
            font-semibold
            ${styles[role]}
            `}
            >

                {role}

            </span>

        );


    };
// ================= MODAL FORM =================


if(loading){

    return (
        <LoadingSpinner text="Loading users..." />
    );

}



return (

<div className="space-y-6">



{/* ERROR MESSAGE */}

{
error &&

<div className="
bg-red-50
border
border-red-200
text-red-600
p-4
rounded-xl
">

{error}

</div>

}







{/* HEADER */}

<div className="
flex
flex-col
md:flex-row
justify-between
gap-4
items-start
md:items-center
">


<div>


<h1 className="
text-3xl
font-bold
text-gray-800
">

User Management

</h1>



<p className="
text-gray-500
mt-1
">

Manage pharmacy staff accounts and permissions

</p>


</div>




<button

onClick={openCreate}

className="
flex
items-center
gap-2
bg-blue-500
hover:bg-blue-600
text-white
px-5
py-3
rounded-xl
shadow-md
hover:shadow-lg
transition
"

>


<Plus size={20}/>

Add User


</button>



</div>









{/* STATISTICS CARDS */}



<div className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-4
gap-5
">





<div className="
bg-white
rounded-xl
shadow-sm
border
p-5
">

<div className="
flex
justify-between
">


<div>

<p className="text-gray-500 text-sm">

Total Users

</p>


<h2 className="
text-3xl
font-bold
text-blue-500
mt-2
">

{totalUsers}

</h2>

</div>


<User
className="
text-blue-500
"
size={35}
/>


</div>

</div>









<div className="
bg-white
rounded-xl
shadow-sm
border
p-5
">


<div className="flex justify-between">


<div>

<p className="text-gray-500 text-sm">

Admins

</p>


<h2 className="
text-3xl
font-bold
text-blue-500
mt-2
">

{adminCount}

</h2>

</div>


<ShieldCheck
className="text-blue-500"
size={35}
/>


</div>


</div>









<div className="
bg-white
rounded-xl
shadow-sm
border
p-5
">


<div className="flex justify-between">


<div>


<p className="text-gray-500 text-sm">

Pharmacists

</p>



<h2 className="
text-3xl
font-bold
text-blue-500
mt-2
">

{pharmacistCount}

</h2>


</div>



<Pill
className="text-blue-500"
size={35}
/>


</div>


</div>









<div className="
bg-white
rounded-xl
shadow-sm
border
p-5
">


<div className="flex justify-between">


<div>

<p className="text-gray-500 text-sm">

Cashiers

</p>


<h2 className="
text-3xl
font-bold
text-blue-500
mt-2
">

{cashierCount}

</h2>


</div>



<WalletCards
className="text-blue-500"
size={35}
/>


</div>


</div>


            <Pagination meta={meta} onPageChange={handlePageChange} />


</div>









{/* SEARCH AND FILTER */}


<div className="
bg-white
rounded-xl
shadow-sm
border
p-5
flex
flex-col
md:flex-row
gap-4
">



<div className="
relative
flex-1
">


<Search

className="
absolute
left-3
top-3
text-gray-400
"

/>



<input


value={search}


onChange={(e)=>setSearch(e.target.value)}


placeholder="Search by name or email..."


className="
w-full
pl-11
py-3
border
rounded-xl
outline-none
focus:ring-2
focus:ring-blue-500
"

/>



</div>






<select


value={roleFilter}


onChange={(e)=>setRoleFilter(e.target.value)}


className="
border
rounded-xl
px-4
py-3
"


>


<option value="all">

All Roles

</option>


<option value="admin">

Admin

</option>


<option value="pharmacist">

Pharmacist

</option>


<option value="cashier">

Cashier

</option>



</select>



</div>









{/* ADD / EDIT MODAL */}



{
showModal &&


<div className="
fixed
inset-0
bg-black
bg-opacity-40
flex
items-center
justify-center
z-50
px-4
">


<div className="
bg-white
rounded-2xl
shadow-xl
w-full
max-w-2xl
p-6
">





<div className="
flex
justify-between
items-center
mb-5
">


<h2 className="
text-xl
font-bold
text-gray-800
">


{
editingUser
?
"Edit User"
:
"Add New User"
}


</h2>



<button

onClick={closeModal}

className="
text-gray-400
hover:text-gray-600
"

>

<X size={22}/>

</button>


</div>








<form

onSubmit={handleSubmit}

className="
grid
grid-cols-1
md:grid-cols-2
gap-5
"

>







<div>

<label className="text-sm font-medium">

Full Name

</label>


<div className="relative mt-1">


<User

size={18}

className="
absolute
left-3
top-3
text-gray-400
"

/>


<input


name="name"


value={form.name}


onChange={handleChange}


required


className="
w-full
pl-10
py-3
border
rounded-xl
"


placeholder="Full name"

/>



</div>


</div>







<div>

<label className="text-sm font-medium">

Email

</label>



<div className="relative mt-1">


<Mail

size={18}

className="
absolute
left-3
top-3
text-gray-400
"

/>


<input


type="email"


name="email"


value={form.email}


onChange={handleChange}


required


className="
w-full
pl-10
py-3
border
rounded-xl
"


placeholder="Email"

/>



</div>


</div>








<div>


<label className="text-sm font-medium">

Role

</label>



<select


name="role"


value={form.role}


onChange={handleChange}


className="
w-full
mt-1
py-3
px-4
border
rounded-xl
"


>


{
roleOptions.map(role=>(

<option

key={role.value}

value={role.value}

>

{role.label}

</option>


))

}


</select>


</div>


// ================= PASSWORD FIELDS =================


<div>


<label className="text-sm font-medium">

Password {editingUser && "(leave empty to keep current)"}

</label>


<div className="relative mt-1">


<Lock

size={18}

className="
absolute
left-3
top-3
text-gray-400
"

/>



<input


type={showPassword ? "text" : "password"}


name="password"


value={form.password}


onChange={handleChange}


minLength={8}


className="
w-full
pl-10
pr-12
py-3
border
rounded-xl
"


placeholder="Password"

/>




<button


type="button"


onClick={()=>setShowPassword(!showPassword)}


className="
absolute
right-3
top-3
text-gray-500
"


>


{
showPassword
?
<EyeOff size={18}/>
:
<Eye size={18}/>
}


</button>



</div>


</div>








<div>


<label className="text-sm font-medium">

Confirm Password

</label>



<div className="relative mt-1">


<Lock

size={18}

className="
absolute
left-3
top-3
text-gray-400
"

/>




<input


type={showConfirm ? "text" : "password"}


name="password_confirmation"


value={form.password_confirmation}


onChange={handleChange}


className="
w-full
pl-10
pr-12
py-3
border
rounded-xl
"


placeholder="Confirm password"

/>




<button


type="button"


onClick={()=>setShowConfirm(!showConfirm)}


className="
absolute
right-3
top-3
text-gray-500
"


>


{
showConfirm
?
<EyeOff size={18}/>
:
<Eye size={18}/>
}


</button>




</div>



</div>










{/* BUTTONS */}


<div className="
md:col-span-2
flex
justify-end
gap-3
mt-3
">


<button


type="button"


onClick={closeModal}


className="
px-5
py-3
border
rounded-xl
hover:bg-gray-50
"


>


Cancel


</button>





<button


disabled={submitting}


className="
flex
items-center
gap-2
px-5
py-3
bg-blue-600
text-white
rounded-xl
hover:bg-blue-700
disabled:opacity-50
"


>


{
submitting

?

<>

<Loader2
size={18}
className="animate-spin"
/>

Saving...

</>

:

<>

<Save size={18}/>

{
editingUser
?
"Update User"
:
"Create User"
}

</>

}



</button>


</div>




</form>


</div>


</div>


}



{/* USERS TABLE */}



<div className="
bg-white
rounded-xl
shadow-sm
border
overflow-hidden
">


<table className="w-full">


<thead className="bg-gray-50">


<tr>


<th className="px-6 py-4 text-left text-sm">

User

</th>


<th className="px-6 py-4 text-left text-sm">

Email

</th>


<th className="px-6 py-4 text-left text-sm">

Role

</th>


<th className="px-6 py-4 text-left text-sm">

Created

</th>


<th className="px-6 py-4 text-right text-sm">

Actions

</th>


</tr>


</thead>







<tbody className="divide-y">


{

filteredUsers.length > 0

?

filteredUsers.map(user=>(


<tr

key={user.id}

className="
hover:bg-gray-50
transition
"

>


<td className="px-6 py-4">


<div className="
flex
items-center
gap-3
">


<div className="
w-10
h-10
rounded-full
bg-blue-600
text-white
flex
items-center
justify-center
font-bold
">


{
user.name?.charAt(0)
}


</div>



<div>


<p className="font-semibold">

{user.name}

</p>


<p className="text-xs text-gray-400">

ID: {user.id}

</p>


</div>


</div>


</td>







<td className="px-6 py-4 text-gray-600">


{user.email}


</td>







<td className="px-6 py-4">


{getRoleBadge(user.role)}


</td>








<td className="px-6 py-4 text-gray-500">


{
user.created_at
?
new Date(user.created_at)
.toLocaleDateString()
:
"-"
}



</td>








<td className="px-6 py-4">


<div className="
flex
justify-end
gap-2
">



<button


onClick={()=>openEdit(user)}


className="
p-2
text-blue-600
hover:bg-blue-50
rounded-lg
"


title="Edit"


>


<Edit size={18}/>


</button>







{

user.id !== currentUser?.id &&


<button


onClick={()=>handleDelete(user.id)}


className="
p-2
text-red-600
hover:bg-red-50
rounded-lg
"


title="Delete"


>


<Trash2 size={18}/>


</button>


}



</div>


</td>





</tr>


))


:


<tr>


<td


colSpan="5"


className="
text-center
py-10
text-gray-400
"


>


No users found


</td>


</tr>


}


</tbody>


</table>


</div>





</div>


);


}