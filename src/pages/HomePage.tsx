import CalendarHeatmap from 'react-calendar-heatmap';
import { useState, useEffect } from 'react';
import 'react-calendar-heatmap/dist/styles.css';
import logo from "../assets/logo.png";
import { signInWithGoogle, logout } from "../services/auth.ts";
import Tooltip from 'react-tooltip';


interface HomePageProps {
    user: {
        photoURL: string | null;
        email: string | null;
        displayName: string | null;
    } | null;
    onLogout: () => void;
}

function HomePage({ user }: HomePageProps) {
    const [showMenu, setShowMenu] = useState(false);
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const [currentDate, setCurrentDate] = useState<string>("");
    const toggleMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // Avoid closing when clicking the avatar
        setShowMenu((prev) => !prev);
    };
    const [transactions, setTransactions] = useState<{ date: string; count: number }[]>([]); // Initialize as empty array
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [note, setNote] = useState('');
    const [heatmapKey, setHeatmapKey] = useState(0);


    useEffect(() => {
        try {
            const saved = localStorage.getItem("transactions");
            if (saved && saved !== "undefined") {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setTransactions(parsed);
                } else {
                    console.warn("Invalid transactions format in localStorage.");
                }
            }
        } catch (e) {
            console.error("Error parsing transactions from localStorage:", e);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("transactions", JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        console.log("Transactions updated (watching state):", transactions);
    }, [transactions]);


    //show the current date when user opens the modal
    useEffect(() => {
        const closeMenu = () => setShowMenu(false);
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, []);


    useEffect(() => {
        const modal = document.getElementById("exampleModal");

        const handleModalShow = () => {
            const today = new Date();
            const formatted = today.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            setCurrentDate(formatted);
        };

        modal?.addEventListener("show.bs.modal", handleModalShow);

        return () => {
            modal?.removeEventListener("show.bs.modal", handleModalShow);
        };
    }, []);



    const handleAddTransaction = () => {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const amountNum = parseFloat(amount);

        if (isNaN(amountNum)) {
            alert("Please enter a valid amount");
            return;
        }

        setTransactions(prev => {
            const existingIndex = prev.findIndex(t => t.date === dateStr);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = { ...updated[existingIndex], count: amountNum };
                return updated;
            } else {
                return [...prev, { date: dateStr, count: amountNum }];
            }
        });



        setHeatmapKey(prev => prev + 1);

        Tooltip.rebuild();

        console.log("Transactions updated:", transactions); // ADD THIS LINE

        // Reset form
        setAmount('');
        setCategory('');
        setLocation('');
        setNote('');

        // Close modal programmatically
        const modalElement = document.getElementById("exampleModal");
        interface Bootstrap {
            Modal: {
                getInstance: (element: HTMLElement) => { hide: () => void } | null;
            };
        }
        const modalInstance = (window as unknown as { bootstrap: Bootstrap }).bootstrap?.Modal.getInstance(modalElement as HTMLElement);
        modalInstance?.hide();

        // 🔧 Clean up leftover Bootstrap modal classes and backdrop
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
    };


    useEffect(() => {
        const timeout = setTimeout(() => {
            Tooltip.rebuild();
        }, 100); // Wait for DOM update

        return () => clearTimeout(timeout);
    }, [transactions]);


    return (
        <>
            {/* Bootstrap Modal for Adding Transaction */}
            <div
                className="modal fade"
                id="exampleModal"
                tabIndex={-1}
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">
                                {currentDate || "Loading..."}
                            </h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="amount-input" className="col-form-label">
                                        Amount:
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="amount-input"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="category-input" className="col-form-label">
                                        Category:
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="category-input"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="location-input" className="col-form-label">
                                        Location:
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="location-input"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>


                                <div className="mb-3">
                                    <label htmlFor="message-text" className="col-form-label">
                                        Add a note:
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="message-text"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleAddTransaction}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>




            {/* Home Page Layout */}
            <div className="home-layout">
                <div className="side-bar">
                    <img className="logo homepage-logo" src={logo} alt="logo" />
                    <button
                        type='button'
                        className="add-transaction-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                    >
                        Add Transaction
                    </button>
                </div>


                <div className="main-bar">

                    {/* heatmap-calender chart */}
                    <div className="global-chart">
                        <CalendarHeatmap
                            key={heatmapKey}
                            startDate={new Date('2025-01-01').toISOString()}
                            endDate={endOfMonth}
                            showMonthLabels={true}
                            gutterSize={4}
                            showWeekdayLabels={true}
                            values={transactions.map(t => ({
                                date: new Date(t.date), // ensure Date object
                                count: t.count
                            }))}

                            classForValue={(value) => {
                                console.log(value); // check if it's undefined or has a count
                                if (!value || typeof value.count !== 'number') return 'c1';
                                if (value.count <= 200) return 'c2';           // ₹0 - ₹200
                                if (value.count <= 400) return 'c3';           // ₹200 - ₹400
                                if (value.count <= 600) return 'c4';           // ₹400 - ₹600
                                if (value.count <= 800) return 'c5';           // ₹600 - ₹800
                                if (value.count <= 1000) return 'c6';          // ₹800 - ₹1000
                                if (value.count <= 5000) return 'c7';          // More than ₹1000
                                return 'c8';                                   // More than ₹5000
                            }}

                            tooltipDataAttrs={(value) => {
                                if (!value || !value.date) {
                                    return { 'data-tooltip-id': 'heatmap-tooltip', 'data-tooltip-content': 'No data' } as { [key: string]: string };
                                }
                                return {
                                    'data-tooltip-id': 'heatmap-tooltip',
                                    'data-tooltip-content': `₹${value.count ?? 0} on ${new Date(value.date).toLocaleDateString()}`
                                } as { [key: string]: string };
                            }}


                        />
                        <Tooltip id="heatmap-tooltip" />


                        {/* years & colors display */}
                        <div className='years-colors-box'>
                            <div className="years">
                                <ul className='years-list'>
                                    <li><a href=''>2025</a></li>
                                    <li><a href=''>2024</a></li>
                                    <li><a href=''>2023</a></li>
                                    <li><a href=''>2022</a></li>
                                </ul>
                            </div>

                            <div className="colors">
                                <div className='color1'>
                                    <div className='color-names'>
                                        <p>Empty</p>
                                        <div className='color-circle c1'></div>
                                    </div>
                                    <div className='color-names'>
                                        <p>₹0 - ₹200</p>
                                        <div className='color-circle c2'></div>
                                    </div><div className='color-names'>
                                        <p>₹200 - ₹400</p>
                                        <div className='color-circle c3'></div>
                                    </div><div className='color-names'>
                                        <p>₹400 - ₹600</p>
                                        <div className='color-circle c4'></div>
                                    </div>
                                </div>
                                <div className='color2'>
                                    <div className='color-names'>
                                        <p>₹600 - ₹800</p>
                                        <div className='color-circle c5'></div>
                                    </div>
                                    <div className='color-names'>
                                        <p>₹800 - ₹1000</p>
                                        <div className='color-circle c6'></div>
                                    </div><div className='color-names'>
                                        <p>More than ₹1000</p>
                                        <div className='color-circle c7'></div>
                                    </div><div className='color-names'>
                                        <p>More than ₹5000</p>
                                        <div className='color-circle c8'></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>





                {/* User Icon */}
                <div className="user-profile" onClick={toggleMenu}>
                    <div className="profile-icon">
                        {user?.displayName?.[0]?.toUpperCase() || "G"}
                    </div>
                    {showMenu && (
                        <div className="user-menu" onClick={(e) => e.stopPropagation()}>
                            <div className="menu-loggedin">
                                <p className="menu-user-email" id="user-email">
                                    {user?.email || "Not logged in"}
                                </p>
                                {user && (
                                    <div className="profile-icon">
                                        {user?.displayName?.[0]?.toUpperCase() || "G"}
                                    </div>
                                )}
                                <p className="menu-user-name" id="user-name">
                                    Hi, {user?.displayName || "Guest"}!
                                </p>
                                <div className="add-account" onClick={signInWithGoogle}>
                                    Switch Account
                                </div>
                                <button onClick={logout} className="logout-account">

                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>



            </div>
        </>
    );
}

export default HomePage;
