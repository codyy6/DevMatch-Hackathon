import { useEffect, useState } from "react"; 
import { Layout, Row, Col, Button, Spin, List, Checkbox, Input } from "antd";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import {
  useWallet,
} from "@aptos-labs/wallet-adapter-react";



const aptosConfig = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(aptosConfig);

// change this to be your module account address
export const moduleAddress =
  "0x7e6c77e8a392680df7199b12dd3882b6d1d5cbb1201a5147be574e03ab0ba4ae";
  
function App() {
  const [tasks, setTasks] = useState([]);
  const { account, signAndSubmitTransaction } = useWallet();
  const [accountHasList, setAccountHasList] = useState(false);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [newTask, setNewTask] = useState("");

  const onWriteTask = (event) => {
    const value = event.target.value;
    setNewTask(value);
  };
  function isValidAptosAddress(address) {
    // Basic check for hex string format and length
    const hexRegex = /^0x[0-9a-fA-F]{64}$/;
    return hexRegex.test(address);
  }
  const onTaskDeleted = async (taskId) => {
    if (!account) return;
    setTransactionInProgress(true);
  
    const transaction = {
      data: {
        function: `${moduleAddress}::todolist::delete_task`,
        functionArguments: [taskId]
      }
    };
  
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });
  
      // filter out the deleted task from the local state
      const updatedTasks = tasks.filter(task => task.task_id !== taskId);
      setTasks(updatedTasks);
    } catch (error) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const onTaskAdded = async () => {
    // check for connected account
    if (!account) return;
    if (!isValidAptosAddress(newTask)) {
        alert("Invalid wallet address");
        setNewTask("");
        return;
    }
    setTransactionInProgress(true);
    const transaction = {
      data: {
        function: `${moduleAddress}::todolist::create_task`,
        functionArguments: [newTask]
      }
    };

    // hold the latest task.task_id from our local state
    const latestId = tasks.length > 0 ? parseInt(tasks[tasks.length - 1].task_id) + 1 : 1;

    // build a newTaskToPush object into our local state
    const newTaskToPush = {
      address: account.address,
      completed: false,
      content: newTask,
      task_id: latestId + "",
    };

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });

      // Create a new array based on current state:
      let newTasks = [...tasks];

      // Add item to the tasks array
      newTasks.push(newTaskToPush);
      // Set state
      setTasks(newTasks);
      // clear input text
      setNewTask("");
    } catch (error) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [account?.address]);

  const fetchList = async () => {
    if (!account) return [];
    try {
      // Try to fetch the TodoList resource
      const todoListResource = await aptos.getAccountResource({
        accountAddress: account?.address,
        resourceType: `${moduleAddress}::todolist::TodoList`,
      });

      // If the resource exists, continue
      setAccountHasList(true);

      // tasks table handle
      const tableHandle = todoListResource.tasks.handle;
      // tasks table counter
      const taskCounter = todoListResource.task_counter;

      let tasks = [];
      let counter = 1;
      while (counter <= taskCounter) {
        const tableItem = {
          key_type: "u64",
          value_type: `${moduleAddress}::todolist::Task`,
          key: `${counter}`,
        };
        const task = await aptos.getTableItem({
          handle: tableHandle,
          data: tableItem,
        });
        tasks.push(task);
        counter++;
      }
      // set tasks in local state
      setTasks(tasks);
    } catch (e) {
      // If the resource doesn't exist, handle the error gracefully
      console.log("TodoList resource not found for this account:", e.response ? e.response.data : e);
      setAccountHasList(false);
    }
  };

  const addNewList = async () => {
    if (!account) return [];
    setTransactionInProgress(true);
    const transaction = {
      data: {
        function: `${moduleAddress}::todolist::create_list`,
        functionArguments: [],
      },
    };
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });
      setAccountHasList(true);
    } catch (error) {
      setAccountHasList(false);
    } finally {
      setTransactionInProgress(false);
    }
  };

  return (
    <>
      <Layout>
        <Row align="middle">
          <Col span={10} offset={2}>
            <h1>Our Inheritance List</h1>
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
                style={{ height: "40px", backgroundColor: "#3f67ff" }}
              >
                Add new list
              </Button>
            </Col>
          </Row>
        ) : (
          <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
            <Col span={8} offset={8}>
              <Input.Group compact>
                <Input
                  onChange={(event) => onWriteTask(event)} // add this
                  style={{ width: "calc(100% - 60px)" }}
                  placeholder="Add a Inheritance Address"
                  size="large"
                  value={newTask} // add this
                />
                <Button
                  onClick={onTaskAdded} // add this
                  type="primary"
                  style={{ height: "40px", backgroundColor: "#3f67ff" }}
                >
                  Add
                </Button>
              </Input.Group>
            </Col>
            <Col span={8} offset={8}>
              {tasks && (
                <List
                size="small"
                bordered
                dataSource={tasks}
                renderItem={(task) => (
                  <List.Item 
                    actions={[
                      <Button 
                        danger 
                        onClick={() => onTaskDeleted(task.task_id)}
                      >
                        Delete
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={task.content}
                    />
                  </List.Item>
                )}
              />
              )}
            </Col>
          </Row>
        )}
      </Spin>
    </>
  );
}

export default App;
