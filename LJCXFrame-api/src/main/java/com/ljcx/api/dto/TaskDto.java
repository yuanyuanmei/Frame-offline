package com.ljcx.api.dto;

import com.ljcx.common.utils.PageDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.List;


@Data
@AllArgsConstructor
@NoArgsConstructor
@NotNull(message = "任务列表信息不能为空")
public class TaskDto extends PageDto {

	/**
	 * id
	 */
	private Long id;
	/**
	 * 团队ID
	 */
	@NotNull(message = "团队Id不能为空")
	private Long teamId;
	/**
	 * 名称
	 */
	private String name;
	/**
	 * 任务类型
	 */
	private Integer type;
	/**
	 * 任务内容
	 */
	private String memo;

	/**
	 * id集合
	 */
	private List<Long> ids;

	/**
	 * 创建用户
	 */
	private Long createUser ;

	/**
	 * 开始时间
	 */
	private Date startTime;

	/**
	 * 结束时间
	 */
	private Date endTime;

	/**
	 * 完成状态（0.未完成，1.正在进行，2.已完成）
	 */
	private Integer completeStatus;

}
