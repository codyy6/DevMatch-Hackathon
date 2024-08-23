import { useEffect, useState } from "react"; 
import { Layout, Row, Col, Button, Spin, List, Input, Checkbox, Select } from "antd";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import moment from 'moment';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(aptosConfig);

// change this to be your module account address
export const moduleAddress = "0x7e6c77e8a392680df7199b12dd3882b6d1d5cbb1201a5147be574e03ab0ba4ae";

function App() {
  const [tasks, setTasks] = useState([]);
  const { account, signAndSubmitTransaction } = useWallet();
  const [accountHasList, setAccountHasList] = useState(false);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [year, setYear] = useState(undefined);  
  const [month, setMonth] = useState(undefined); 
  const [selectedYear, setSelectedYear] = useState(undefined);

  const onWriteTask = (event) => {
    const value = event.target.value;
    setNewTask(value);
  };

  const onYearChange = (value) => {
    setYear(value);
  };

  const onMonthChange = (value) => {
    setMonth(value);
  };

  const onYearSelect = (value) => {
    setSelectedYear(value);
  };

  const onTaskAdded = async () => {
    if (!account) return;

    setTransactionInProgress(true);
    const transaction = {
      data: {
        function: `${moduleAddress}::goallist::create_goal`,
        functionArguments: [newTask, year, month]
      }
    };

    const latestId = tasks.length > 0 ? parseInt(tasks[tasks.length - 1].task_id) + 1 : 1;
    const newTaskToPush = {
      address: account.address,
      completed: false,
      content: newTask,
      task_id: latestId + "",
      year,
      month,
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });

      let newTasks = [...tasks];
      newTasks.push(newTaskToPush);
      setTasks(newTasks);
      setNewTask("");
      setYear(undefined);
      setMonth(undefined);
    } catch (error) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const fetchList = async () => {
    if (!account) return [];
    try {
      const todoListResource = await aptos.getAccountResource({
        accountAddress: account?.address,
        resourceType: `${moduleAddress}::goallist::GoalList`,
      });
      setAccountHasList(true);

      const tableHandle = todoListResource.goals.handle;
      const taskCounter = todoListResource.goal_counter;

      let tasks = [];
      let counter = 1;
      while (counter <= taskCounter) {
        const tableItem = {
          key_type: "u64",
          value_type: `${moduleAddress}::goallist::Goal`,
          key: `${counter}`,
        };
        
        const task = await aptos.getTableItem({
          handle: tableHandle,
          data: tableItem,
        });
        tasks.push(task);
        counter++;
      }
      setTasks(tasks);
    } catch (e) {
      console.log("GoalList resource not found for this account:", e.response ? e.response.data : e);
      setAccountHasList(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [account?.address]);

  const addNewList = async () => {
    if (!account) return [];

    setTransactionInProgress(true);
    const transaction = {
      data: {
        function: `${moduleAddress}::goallist::create_list`,
        functionArguments: [],
      },
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      setAccountHasList(true);
    } catch (error) {
      setAccountHasList(false);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const onCheckboxChange = async (taskId, isChecked) => {
    if (!account) return;

    setTransactionInProgress(true);
    const transaction = {
      data: {
        function: `${moduleAddress}::goallist::complete_goal`,
        functionArguments: [taskId],
      },
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.task_id === taskId ? { ...task, completed: isChecked } : task
        )
      );
    } catch (error) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const convertToMonth = (month) => {
    month = parseFloat(month);
    let monthString = "";
    switch (month) {
      case 1:
        monthString = "January";
        break;
      case 2:
        monthString = "February";
        break;
      case 3:
        monthString = "March";
        break;
      case 4:
        monthString = "April";
        break;
      case 5:
        monthString = "May";
        break;
      case 6:
        monthString = "June";
        break;
      case 7:
        monthString = "July";
        break;
      case 8:
        monthString = "August";
        break;
      case 9:
        monthString = "September";
        break;
      case 10:
        monthString = "October";
        break;
      case 11:
        monthString = "November";
        break;
      case 12:
        monthString = "December";
        break;
      default:
        monthString = "testing";
        break;
    }
    return monthString;
  }
  const years = [...new Set(tasks.map(task => task.year))]; // Extract unique years
  const filteredTasks = selectedYear ? tasks.filter(task => task.year === selectedYear) : tasks;

  return (
    <>
      <Layout>
        <Row align="middle">
          <Col span={10} offset={2}>
            <h1>Personal Goal List</h1>
          </Col>
          <Col span={12} style={{ textAlign: "right", paddingRight: "200px" }}>
            <WalletSelector />
          </Col>
        </Row>
      </Layout>
      <Spin spinning={transactionInProgress}>
        {!accountHasList ? (
          <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
            <Col span={8} offset={8}>
              <Button
                disabled={!account}
                block
                onClick={addNewList}
                type="primary"
                style={{ height: "40px", backgroundColor: "#3f67ff", marginTop: "16px" }}
              >
                Add new list
              </Button>
            </Col>
          </Row>
        ) : (
          <>
            <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
              <Col span={8} offset={8}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select Year"
                  onChange={onYearSelect}
                  value={selectedYear}
                  allowClear
                >
                  {years.map(year => (
                    <Select.Option key={year} value={year}>
                      {year}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>

            <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
              <Col span={8} offset={8}>
                <Input.Group compact>
                  <Input
                    onChange={(event) => onWriteTask(event)}
                    placeholder="Add a New Goal"
                    size="large"
                    value={newTask}
                  />
                  <Select
                    placeholder="Year"
                    value={year}
                    onChange={onYearChange}
                    style={{ width: "50%" }}
                    allowClear
                  >
                      {Array.from({ length: 100 }, (_, i) => moment().year() + i).map((year) => (
                      <Select.Option key={year} value={year}>
                        {year}
                      </Select.Option>
                    ))}
                  </Select>
                  <Select
                    placeholder="Month"
                    value={month}
                    onChange={onMonthChange}
                    style={{ width: "50%" }}
                    allowClear
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <Select.Option key={month} value={month}>
                        {convertToMonth(month)}
                      </Select.Option>
                    ))}
                  </Select>
                  <Button
                    onClick={onTaskAdded}
                    type="primary"
                    style={{ height: "40px", backgroundColor: "#3f67ff", width: "100%", marginTop: "16px" }}
                  >
                    Add
                  </Button>
                </Input.Group>
              </Col>
            </Row>

            <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
              <Col span={8} offset={8}>
                {filteredTasks && (
                  <List
                    size="small"
                    bordered
                    dataSource={filteredTasks}
                    renderItem={(task) => (
                      <List.Item 
                        actions={[
                          <Checkbox
                            checked={task.completed}
                            onChange={(e) => onCheckboxChange(task.goal_id, e.target.checked)}
                         

                          >
                          </Checkbox>
                        ]}
                      >
                        
                        <List.Item.Meta
                            title={`${task.content} `}
                            description={`Deadline: ${convertToMonth(task.month)}, ${task.year}`}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Col>
            </Row>
          </>
        )}
      </Spin>
    </>
  );
}

export default App;
