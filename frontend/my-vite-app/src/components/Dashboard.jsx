import { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  ArcElement, // For Pie chart
} from "chart.js";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  TablePagination,
} from "@mui/material";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [month, setMonth] = useState("March");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchData();
  }, [month, search, page, rowsPerPage]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/combined?month=${month}&search=${search}&page=${
          page + 1
        }&rowsPerPage=${rowsPerPage}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!data) return <div>Loading...</div>;

  const barChartData = {
    labels: Object.keys(data.barChart),
    datasets: [
      {
        label: "Number of Items",
        data: Object.values(data.barChart),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const pieChartData = {
    labels: data.pieChart.map((item) => item.category),
    datasets: [
      {
        label: "Categories",
        data: data.pieChart.map((item) => item.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
      },
    ],
  };

  return (
    <div>
      <h1>Transaction Dashboard</h1>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        maxWidth={"800px"}
      >
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          style={{ marginRight: "16px", flex: 1 }}
        />
        <FormControl variant="outlined" style={{ minWidth: 120 }}>
          <InputLabel id="month-select-label">Month</InputLabel>
          <Select
            labelId="month-select-label"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            label="Month"
          >
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((monthName) => (
              <MenuItem key={monthName} value={monthName}>
                {monthName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {data.transactions.transactions.length === 0 ? (
        <Typography variant="h6" color="textSecondary">
          No transactions found.
        </Typography>
      ) : (
        <TableContainer component={Paper} maxWidth={"800px"}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Sold</TableCell>
                <TableCell>Date of Sale</TableCell>
                <TableCell>Image</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.transactions.transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{transaction.title}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>${transaction.price}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.sold ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {new Date(transaction.dateOfSale).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {/* Display the image */}
                    <img
                      src={transaction.image} // Assuming 'transaction.image' holds the URL
                      alt={transaction.title} // Alt text for accessibility
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }} // Style the image
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.transactions.total} // Total number of transactions from backend
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      <h2>Statistics - {month}</h2>
      <Typography variant="body1">
        Total Sale Amount: ${data.statistics.totalSaleAmount.toFixed(2)}
      </Typography>
      <Typography variant="body1">
        Total Sold Items: {data.statistics.totalSoldItems}
      </Typography>
      <Typography variant="body1">
        Total Not Sold Items: {data.statistics.totalNotSoldItems}
      </Typography>

      <h2>Bar Chart - {month}</h2>
      <div style={{ maxWidth: "700px", margin: "50px" }}>
        <Bar
          data={barChartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: true,
                text: "Items Sold by Price Range",
              },
            },
            scales: {
              x: {
                type: "category",
              },
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>
      <h2>Pie chart - {month}</h2>
      <div style={{ maxWidth: "500px", margin: "50px" }}>
        <Pie
          data={pieChartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "right",
              },
              title: {
                display: true,
                text: "Distribution of Categories",
              },
            },
          }}
        />
        /
      </div>
    </div>
  );
};

export default Dashboard;
