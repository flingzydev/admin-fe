import { Link } from 'react-router-dom';
import { Task } from '../types';
import {taskStatusReverseMap, taskTypeReverseMap} from '../constants';

interface TaskCardProps {
    task: Task | null;
    taskType: string | undefined;
}

const TaskCard = ({
    task,
    taskType,
}: TaskCardProps) => {
    const TaskInfoRow = ({ label, value }: { label: string; value: string | number }) => (
        <div className="grid grid-cols-3 py-0 border-b border-gray-100">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="text-sm text-gray-900 col-span-2">{value}</dd>
        </div>
    );

    if (!task) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="text-center py-8">
                    <p className="text-lg text-gray-600 mb-4">
            <span className="font-semibold lowercase">
              {taskTypeReverseMap[Number(taskType)]}
            </span>{' '}
                        queue is empty
                    </p>
                    <Link
                        to="/home"
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        Go back to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                {`${taskTypeReverseMap[task.queue_type]} Task`}
            </h2>
            <dl className="space-y-2">
                <TaskInfoRow label="ID" value={task.id} />
                <TaskInfoRow label="Status" value={taskStatusReverseMap[task.status]} />
                <TaskInfoRow label="Queue Type" value={taskTypeReverseMap[task.queue_type]} />
                <TaskInfoRow label="Created At" value={task.created_at} />
                <TaskInfoRow label="Updated At" value={task.updated_at} />
                <TaskInfoRow label="Source User ID" value={task.src_user_id} />
                <TaskInfoRow label="Destination User ID" value={task.dst_user_id} />
            </dl>

            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Metadata</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-gray-700">
            {task.metadata ? JSON.stringify(task.metadata, null, 2) : 'No metadata'}
          </pre>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;