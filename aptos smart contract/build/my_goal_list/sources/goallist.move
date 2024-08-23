module goallist_addr::goallist {
 
    use aptos_framework::event;
    use std::signer;
    use aptos_std::table::{Self, Table};
    use aptos_framework::account;
    use std::string::String;

    #[test_only]
    use std::string;
    // Errors
    const E_NOT_INITIALIZED: u64 = 1;
    const EGOAL_DOESNT_EXIST: u64 = 2;
    const EGOAL_IS_COMPLETED: u64 = 3;

    struct GoalList has key {
        goals: Table<u64, Goal>,
        set_goal_event: event::EventHandle<Goal>,
        goal_counter: u64,
    }

    
    struct Goal has store, drop, copy {
        goal_id: u64,
        address:address,
        content: String,
        completed: bool,
        year: u64,
        month: String,
    }

    public entry fun create_list(account: &signer){
        let goals_holder = GoalList {
            goals: table::new(),
            set_goal_event: account::new_event_handle<Goal>(account),
            goal_counter: 0,
            
        };
        // move the TodoList resource under the signer account
        move_to(account, goals_holder);
    }

    public entry fun create_goal(account: &signer, content: String, year: u64, month: String) acquires GoalList {
        // gets the signer address
        let signer_address = signer::address_of(account);
        
        // assert signer has created a list
        assert!(exists<GoalList>(signer_address), E_NOT_INITIALIZED);
        // gets the TodoList resource
        let goal_list = borrow_global_mut<GoalList>(signer_address);
        // increment task counter
        let counter = goal_list.goal_counter + 1;
        // creates a new Task
        let new_goal = Goal {
            goal_id: counter,
            address: signer_address,
            content,
            completed: false,
            year,
            month,
        };
        // adds the new task into the goals table
        table::upsert(&mut goal_list.goals, counter, new_goal);
        // sets the task counter to be the incremented counter
        goal_list.goal_counter = counter;
        // fires a new task created event
        event::emit_event<Goal>(
            &mut borrow_global_mut<GoalList>(signer_address).set_goal_event,
            new_goal,
        );
    }

    public entry fun complete_goal(account: &signer, goal_id: u64) acquires GoalList {
        // gets the signer address
        let signer_address = signer::address_of(account);
        assert!(exists<GoalList>(signer_address), E_NOT_INITIALIZED);
        // gets the TodoList resource
        let goal_list = borrow_global_mut<GoalList>(signer_address);
        // assert task exists
        assert!(table::contains(&goal_list.goals, goal_id), EGOAL_DOESNT_EXIST);
        // gets the task matched the task_id
        let goal_record = table::borrow_mut(&mut goal_list.goals, goal_id);
        // assert task is not completed
        assert!(goal_record.completed == false, EGOAL_IS_COMPLETED);
        // update task as completed
        goal_record.completed = true;
    }

    #[test(admin = @0x123)]
    public entry fun test_flow(admin: signer) acquires TodoList {
        // creates an admin @todolist_addr account for test
        account::create_account_for_test(signer::address_of(&admin));
        // initialize contract with admin account
        create_list(&admin, 2022, 10);
        
        // creates a task by the admin account
        create_goal(&admin, string::utf8(b"New Goal"));
        let goal_count = event::counter(&borrow_global<TodoList>(signer::address_of(&admin)).set_goal_event);
        assert!(goal_count == 1, 4);
        let goal_list = borrow_global<TodoList>(signer::address_of(&admin));
        assert!(goal_list.goal_counter == 1, 5);
        let goal_record = table::borrow(&goal_list.goals, goal_list.goal_counter);
        assert!(goal_record.goal_id == 1, 6);
        assert!(goal_record.completed == false, 7);
        assert!(goal_record.content == string::utf8(b"New Goal"), 8);
        assert!(goal_record.address == signer::address_of(&admin), 9);
        
        // updates task as completed
        complete_goal(&admin, 1);
        let goal_list = borrow_global<TodoList>(signer::address_of(&admin));
        let goal_record = table::borrow(&goal_list.goals, 1);
        assert!(goal_record.goal_id == 1, 10);
        assert!(goal_record.completed == true, 11);
        assert!(goal_record.content == string::utf8(b"New Goal"), 12);
        assert!(goal_record.address == signer::address_of(&admin), 13);
    }

    #[test(admin = @0x123)]
    #[expected_failure(abort_code = E_NOT_INITIALIZED)]
    public entry fun account_can_not_update_goal(admin: signer) acquires TodoList {
        // creates an admin @todolist_addr account for test
        account::create_account_for_test(signer::address_of(&admin));
        // account can not toggle task as no list was created
        complete_goal(&admin, 2);
    }
}
